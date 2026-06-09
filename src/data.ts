export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'comidas' | 'bebidas' | 'postres';
  subcategory: string;
  description: string;
  image: string;
}

export const CATEGORIES_LABELS: Record<string, string> = {
  comidas: 'Platillos & Antojitos',
  bebidas: 'Bebidas & Elixires',
  postres: 'Postres & Dulces Antojos',
};

export const SUBCATEGORIES_LABELS: Record<string, string> = {
  antojitos: 'Antojitos de la Casa',
  platos_fuertes: 'Platos Fuertes',
  cortes_premium: 'Cortes Premium 🔥',
  extras: 'Extras / Acompañamientos',
  bebidas_calientes: 'Cafetería Caliente',
  bebidas_frias: 'Frappés & Bebidas Frías',
  limonadas: 'Limonadas Especiales',
  postres: 'Postres & Dulces de la Casa',
};

export const MENU_ITEMS: MenuItem[] = [
  // CATEGORÍA: COMIDAS -> Antojitos
  {
    id: 'tostones-queso',
    name: 'Tostones con queso',
    price: 130,
    category: 'comidas',
    subcategory: 'antojitos',
    description: 'Crujientes tostones de plátano verde con generoso queso frito waslaleño.',
    image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'salchipapas',
    name: 'Salchipapas de la casa',
    price: 180,
    category: 'comidas',
    subcategory: 'antojitos',
    description: 'Papas fritas doraditas con salchichas seleccionadas, acompañadas de aderezos caseros.',
    image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'quesadillas-pollo',
    name: 'Quesadillas de pollo',
    price: 220,
    category: 'comidas',
    subcategory: 'antojitos',
    description: 'Tortilla de harina rellena de pollo desmenuzado sazonado y abundante queso fundido.',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'hamburguesa-res',
    name: 'Hamburguesa de res con papas',
    price: 280,
    category: 'comidas',
    subcategory: 'antojitos',
    description: 'Jugosa carne de res de primera calidad, queso cheddar derretido, vegetales frescos y papas fritas.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80'
  },

  // CATEGORÍA: COMIDAS -> Platos Fuertes
  {
    id: 'filete-res',
    name: 'Filete de res a la plancha',
    price: 380,
    category: 'comidas',
    subcategory: 'platos_fuertes',
    description: 'Exquisito corte de lomo de res cocinado a la plancha al término de su elección, servido con guarniciones.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'filete-cerdo',
    name: 'Filete de cerdo a la plancha',
    price: 360,
    category: 'comidas',
    subcategory: 'platos_fuertes',
    description: 'Filete de cerdo sumamente jugoso, marinado con finas hierbas y asado a la plancha.',
    image: 'https://images.unsplash.com/photo-1602410214349-43a512d7c0bc?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'filete-pollo',
    name: 'Filete de pollo a la plancha',
    price: 350,
    category: 'comidas',
    subcategory: 'platos_fuertes',
    description: 'Pechuga de pollo fileteada, sazonada con especias aromáticas y sellada a la plancha.',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'fajitas-mixtas',
    name: 'Fajitas mixtas',
    price: 320,
    category: 'comidas',
    subcategory: 'platos_fuertes',
    description: 'Tiras saltadas de res, pollo y cerdo con pimientos, cebollas y especias de la casa.',
    image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'deditos-pollo-completo',
    name: 'Deditos de pollo completo',
    price: 310,
    category: 'comidas',
    subcategory: 'platos_fuertes',
    description: 'Crujientes deditos de pechuga de pollo empanizados, servidos con papas, ensalada y salsa especial.',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'deditos-pollo-sencillo',
    name: 'Deditos de pollo sencillo',
    price: 280,
    category: 'comidas',
    subcategory: 'platos_fuertes',
    description: 'Deditos de pollo empanizados crujientes con sus aderezos favoritos.',
    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'alitas-papas',
    name: 'Alitas con papas + salsas',
    price: 300,
    category: 'comidas',
    subcategory: 'platos_fuertes',
    description: 'Alitas de pollo perfectamente sazonadas, fritas al punto exacto, guarnecidas con papas francesas.',
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=500&q=80'
  },

  // CATEGORÍA: COMIDAS -> Cortes Premium
  {
    id: 'rib-eye',
    name: 'Rib Eye Premium',
    price: 680,
    category: 'comidas',
    subcategory: 'cortes_premium',
    description: 'Corte marmoleado de extraordinaria jugosidad y suavidad extrema, asado a la perfección con mantequilla de ajo.',
    image: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'new-york',
    name: 'New York Strip',
    price: 660,
    category: 'comidas',
    subcategory: 'cortes_premium',
    description: 'Corte de carne tierno y con gran sabor característico, sellado a fuego alto con romero fresco.',
    image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=500&q=80'
  },

  // CATEGORÍA: COMIDAS -> Extras
  {
    id: 'extra-tostones',
    name: 'Extras tostones',
    price: 40,
    category: 'comidas',
    subcategory: 'extras',
    description: 'Porción adicional de crujientes tostones hechos al momento.',
    image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'extra-arroz',
    name: 'Porción de arroz',
    price: 30,
    category: 'comidas',
    subcategory: 'extras',
    description: 'Arroz blanco clásico, suelto y perfectamente sazonado.',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'extra-papas',
    name: 'Porción de papas',
    price: 60,
    category: 'comidas',
    subcategory: 'extras',
    description: 'Papas francesas fritas sazonadas con sal marina fina.',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=500&q=80'
  },

  // CATEGORÍA: BEBIDAS -> Bebidas Calientes
  {
    id: 'americano',
    name: 'Café Americano',
    price: 60,
    category: 'bebidas',
    subcategory: 'bebidas_calientes',
    description: 'Café espresso diluido con agua caliente, resaltando la pureza de los granos de altura de Waslala.',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'capuccino-sencillo',
    name: 'Capuccino sencillo',
    price: 75,
    category: 'bebidas',
    subcategory: 'bebidas_calientes',
    description: 'Café espresso con partes iguales de leche vaporizada y espuma aterciopelada.',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'capuccino-doble',
    name: 'Capuccino doble',
    price: 90,
    category: 'bebidas',
    subcategory: 'bebidas_calientes',
    description: 'Espresso doble con una nube de espuma de leche densa y cremosa, decorado con cacao.',
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'mocaccino',
    name: 'Café Mocaccino',
    price: 100,
    category: 'bebidas',
    subcategory: 'bebidas_calientes',
    description: 'Combinación perfecta de espresso, jarabe de chocolate artesanal, leche vaporizada y una corona de espuma.',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'dirty-chai-tea',
    name: 'Dirty chai tea',
    price: 90,
    category: 'bebidas',
    subcategory: 'bebidas_calientes',
    description: 'Té negro especiado (Chai) endulzado con un shot de espresso Waslaleño.',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=500&q=80'
  },

  // CATEGORÍA: BEBIDAS -> Bebidas Frías
  {
    id: 'frappuccino',
    name: 'Frappuccino Clásico',
    price: 100,
    category: 'bebidas',
    subcategory: 'bebidas_frias',
    description: 'Café espresso licuado con hielo, leche premium y jarabe de crema inglesa.',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'frappe-caramelo',
    name: 'Frappe de caramelo',
    price: 115,
    category: 'bebidas',
    subcategory: 'bebidas_frias',
    description: 'Licuado cremoso de café y caramelo líquido, coronado con nata montada y un toque de toffee.',
    image: 'https://images.unsplash.com/photo-1596152497892-ec382a818788?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'frappe-chocolate',
    name: 'Frappe de chocolate',
    price: 115,
    category: 'bebidas',
    subcategory: 'bebidas_frias',
    description: 'Sabor intenso a cacao Waslaleño triturado con hielo y leche condensada suave.',
    image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'frappe-oreo',
    name: 'Frappe de galleta Oreo',
    price: 125,
    category: 'bebidas',
    subcategory: 'bebidas_frias',
    description: 'Fusión helada de galletas Oreo trituradas, vainilla francesa, leche condensada y nata.',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'frappe-mani',
    name: 'Frappe de maní tostado',
    price: 120,
    category: 'bebidas',
    subcategory: 'bebidas_frias',
    description: 'Deliciosa e inusual combinación de crema de maní artesanal, café helado y trozos de maní salado.',
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'frappe-vainilla',
    name: 'Frappe de Vainilla Francesa',
    price: 140,
    category: 'bebidas',
    subcategory: 'bebidas_frias',
    description: 'Helado indulgente de vainilla francesa de Madagascar, mezclado con espresso concentrado.',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'iced-latte',
    name: 'Iced Latte Clásico',
    price: 90,
    category: 'bebidas',
    subcategory: 'bebidas_frias',
    description: 'Espresso vertido suavemente sobre leche fría y cubos de hielo transparentes.',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'iced-latte-saborizado',
    name: 'Iced Latte Saborizado',
    price: 110,
    category: 'bebidas',
    subcategory: 'bebidas_frias',
    description: 'Iced latte con jarabes artesanales a elegir: Caramelo, avellana, vainilla, amaretto o té chai.',
    image: 'https://images.unsplash.com/photo-1461023717517-238b712c40ac?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'batido-fresa',
    name: 'Batido natural de fresa',
    price: 130,
    category: 'bebidas',
    subcategory: 'bebidas_frias',
    description: 'Fresas silvestres trituradas con leche fresca o agua aromatizada.',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'batido-blueberry',
    name: 'Batido natural de Blueberry',
    price: 130,
    category: 'bebidas',
    subcategory: 'bebidas_frias',
    description: 'Arándanos maduros licuados con yogur griego y un delicado hilo de miel de abeja.',
    image: 'https://images.unsplash.com/photo-1626256111162-8418086055bc?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'batido-frutas-mixtas',
    name: 'Batido de frutas mixtas',
    price: 120,
    category: 'bebidas',
    subcategory: 'bebidas_frias',
    description: 'Mango, piña, papaya y banano Waslaleño, licuados hasta conseguir una sedosa textura.',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=500&q=80'
  },

  // CATEGORÍA: BEBIDAS -> Limonadas
  {
    id: 'limonada-clasica',
    name: 'Limonada clásica fresca',
    price: 90,
    category: 'bebidas',
    subcategory: 'limonadas',
    description: 'Limones persas recién exprimidos con agua purificada helada y azúcar de caña.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'limonada-hierbabuena',
    name: 'Limonada con hierbabuena',
    price: 110,
    category: 'bebidas',
    subcategory: 'limonadas',
    description: 'La frescura inigualable del limón combinada con hojas de hierbabuena maceradas al instante.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'limonada-frutos-rojos',
    name: 'Limonada de frutos rojos',
    price: 120,
    category: 'bebidas',
    subcategory: 'limonadas',
    description: 'Limonada gourmet macerada con jugosos arándanos, fresas y frambuesas de la zona.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'limonada-clasica-frutos-rojos',
    name: 'Limonada clásica frutos rojos',
    price: 105,
    category: 'bebidas',
    subcategory: 'limonadas',
    description: 'Una versión tradicional refrescante con capas de jarabe natural de frutos silvestres rojos.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=80'
  },
  // CATEGORÍA: POSTRES -> Dulces Tentaciones
  {
    id: 'tres-leches-waslaleño',
    name: 'Tres Leches Waslaleño',
    price: 140,
    category: 'postres',
    subcategory: 'postres',
    description: 'Cremoso postre tradicional nicaragüense bañado en tres tipos de leche con un sutil merengue quemado.',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'brownie-helado',
    name: 'Brownie Fudge con Helado',
    price: 120,
    category: 'postres',
    subcategory: 'postres',
    description: 'Fudge brownie de chocolate oscuro servido calientito con una bola helada de vainilla premium.',
    image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'cheesecake-frutos-rojos',
    name: 'Cheesecake de Frutos Rojos',
    price: 135,
    category: 'postres',
    subcategory: 'postres',
    description: 'Sublime tarta de queso crema suave, coronada con jalea densa de fresas y moras cosechadas en Waslala.',
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=500&q=80'
  }
];
