import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { Role } from '../src/auth/roles.js';

describe('Rôles et permissions (e2e)', () => {
  let app: INestApplication<App>;
  const tokens = {} as Record<Role, string>;
  const ids = {} as Record<Role, string>;
  let listId: string;
  let otherListId: string;
  let cardId: string;

  const api = () => request(app.getHttpServer());
  const as = (role: Role) => ({ Authorization: `Bearer ${tokens[role]}` });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Le premier inscrit devient ADMIN, il attribue ensuite les rôles aux autres.
    for (const role of [Role.ADMIN, Role.PO, Role.DEV, Role.MOA, Role.MOE]) {
      const email = `${role.toLowerCase()}@test.dev`;
      const res = await api()
        .post('/api/auth/register')
        .send({ email, password: 'secret123', name: role })
        .expect(201);
      ids[role] = res.body.id;
      const login = await api()
        .post('/api/auth/login')
        .send({ email, password: 'secret123' });
      tokens[role] = login.body.accessToken;
    }
    for (const role of [Role.PO, Role.MOA, Role.MOE]) {
      await api()
        .patch(`/api/users/${ids[role]}`)
        .set(as(Role.ADMIN))
        .send({ role })
        .expect(200);
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('le premier inscrit est ADMIN, les suivants DEV par défaut', async () => {
    const admin = await api()
      .get('/api/users/me')
      .set(as(Role.ADMIN))
      .expect(200);
    expect(admin.body.role).toBe(Role.ADMIN);
    const dev = await api().get('/api/users/me').set(as(Role.DEV)).expect(200);
    expect(dev.body.role).toBe(Role.DEV);
    expect(dev.body.permissions).toEqual([
      'board:read',
      'card:create',
      'card:update',
    ]);
    expect(dev.body).not.toHaveProperty('password');
  });

  it('refuse les routes protégées sans token (401)', async () => {
    await api().get('/api/lists').expect(401);
  });

  it('seul un ADMIN peut lister les utilisateurs et changer un rôle', async () => {
    const res = await api().get('/api/users').set(as(Role.ADMIN)).expect(200);
    expect(res.body).toHaveLength(5);
    expect(res.body[0]).not.toHaveProperty('password');
    await api().get('/api/users').set(as(Role.PO)).expect(403);
    await api()
      .patch(`/api/users/${ids[Role.DEV]}`)
      .set(as(Role.PO))
      .send({ role: Role.PO })
      .expect(403);
  });

  it('empêche de retirer le dernier administrateur', async () => {
    await api()
      .patch(`/api/users/${ids[Role.ADMIN]}`)
      .set(as(Role.ADMIN))
      .send({ role: Role.DEV })
      .expect(400);
  });

  it('seul le PO (ou l’admin) gère les colonnes', async () => {
    await api()
      .post('/api/lists')
      .set(as(Role.DEV))
      .send({ title: 'Nope' })
      .expect(403);
    await api()
      .post('/api/lists')
      .set(as(Role.MOA))
      .send({ title: 'Nope' })
      .expect(403);
    const res = await api()
      .post('/api/lists')
      .set(as(Role.PO))
      .send({ title: 'À faire' })
      .expect(201);
    listId = res.body.id;
    const other = await api()
      .post('/api/lists')
      .set(as(Role.PO))
      .send({ title: 'En cours' })
      .expect(201);
    otherListId = other.body.id;
  });

  it('tout le monde voit le tableau partagé', async () => {
    for (const role of [Role.DEV, Role.MOA, Role.MOE]) {
      const res = await api().get('/api/lists').set(as(role)).expect(200);
      expect(res.body.map((l: { id: string }) => l.id)).toEqual([
        listId,
        otherListId,
      ]);
    }
  });

  it('la MOA crée des demandes mais ne peut pas les modifier', async () => {
    const res = await api()
      .post(`/api/lists/${listId}/cards`)
      .set(as(Role.MOA))
      .send({
        title: 'Besoin client',
        category: 'feature',
        dueDate: '2026-12-01',
      })
      .expect(201);
    cardId = res.body.id;
    expect(res.body.description).toBe('');
    await api()
      .patch(`/api/cards/${cardId}`)
      .set(as(Role.MOA))
      .send({ title: 'x' })
      .expect(403);
  });

  it('le DEV modifie et déplace une carte, mais ne la supprime pas', async () => {
    await api()
      .post(`/api/lists/${listId}/cards`)
      .set(as(Role.DEV))
      .send({ title: 'Deuxième' })
      .expect(201);
    const res = await api()
      .patch(`/api/cards/${cardId}`)
      .set(as(Role.DEV))
      .send({ description: 'Détail', listId: otherListId, position: 0 })
      .expect(200);
    expect(res.body).toMatchObject({
      listId: otherListId,
      position: 0,
      description: 'Détail',
    });

    const remaining = await api()
      .get(`/api/lists/${listId}/cards`)
      .set(as(Role.DEV))
      .expect(200);
    expect(remaining.body.map((c: { position: number }) => c.position)).toEqual(
      [0],
    );

    await api().delete(`/api/cards/${cardId}`).set(as(Role.DEV)).expect(403);
  });

  it('rejette une catégorie inconnue (400)', async () => {
    await api()
      .post(`/api/lists/${listId}/cards`)
      .set(as(Role.PO))
      .send({ title: 'x', category: 'inconnue' })
      .expect(400);
  });

  it('la MOE peut supprimer une carte', async () => {
    await api().delete(`/api/cards/${cardId}`).set(as(Role.MOE)).expect(204);
    await api().get(`/api/cards/${cardId}`).set(as(Role.MOE)).expect(404);
  });

  it('un changement de rôle s’applique sans se reconnecter', async () => {
    await api()
      .patch(`/api/users/${ids[Role.DEV]}`)
      .set(as(Role.ADMIN))
      .send({ role: Role.PO })
      .expect(200);
    await api()
      .post('/api/lists')
      .set(as(Role.DEV))
      .send({ title: 'Revue' })
      .expect(201);
  });
});
