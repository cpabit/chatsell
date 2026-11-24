// Carga inicial de ChatSell: los 5 productos de Bocaditos y los ajustes de Bocado.
//
// Uso (Node 20.6 o superior):
//   node --env-file=.env.local scripts/seed.mjs
//   node --env-file=.env.local scripts/seed.mjs --force   (sobrescribe lo existente)
//
// Sin --force, lo que ya existe se omite, así no pisa cambios hechos desde el panel.

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  console.error(
    'Faltan variables de entorno: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY.'
  );
  process.exit(1);
}

initializeApp({
  credential: cert({
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore();
const force = process.argv.includes('--force');

// ID legible, nombre, descripción y precio en pesos colombianos.
const products = [
  {
    id: 'arepas-de-yuca',
    name: 'Arepas de yuca',
    description: 'Arepas doble queso de 170 g cada una.',
    price: 20000,
  },
  {
    id: 'panes-de-yuca',
    name: 'Panes de yuca',
    description: 'Suaves y esponjosos, para cada ocasión.',
    price: 8000,
  },
  {
    id: 'mantequilla-ajo-finas-hierbas',
    name: 'Mantequilla de ajo en finas hierbas',
    description: 'Cremosa y rica para acompañar tus mejores momentos.',
    price: 15000,
  },
  {
    id: 'mantequilla-ajo-picante',
    name: 'Mantequilla de ajo picante',
    description: 'Exquisita para acompañar tus mejores momentos.',
    price: 15000,
  },
  {
    id: 'ajos-confitados',
    name: 'Ajos confitados',
    description: 'Especiales para acompañar tus mejores recetas en tu cocina.',
    price: 12000,
  },
];

const settings = {
  businessName: 'Bocaditos By Andrea Sanchez',
  botName: 'Bocado',
  greeting: '¡Hola, amigo! Me da gusto que quieras probar el sabor rico y tradicional!',
  tone: 'cálido, amable, no formal pero serio',
};

async function seed(ref, data) {
  const snap = await ref.get();
  if (snap.exists && !force) {
    console.log(`= ${ref.path} ya existe, se omite`);
    return;
  }
  await ref.set(data);
  console.log(`+ ${ref.path}`);
}

for (const [index, { id, ...product }] of products.entries()) {
  await seed(db.collection('products').doc(id), {
    ...product,
    imageUrl: '', // se completa al subir la foto desde el panel
    active: true,
    order: index + 1,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: 'seed',
  });
}

await seed(db.collection('settings').doc('general'), settings);

console.log('Listo. La colección leads se crea sola con el primer contacto del chat.');
