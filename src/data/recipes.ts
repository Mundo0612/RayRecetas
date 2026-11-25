/*
  Mock data for Recetas de Familia.

  RULE: `words` is always the recipe holder's own phrasing. It is never
  translated or rewritten by the app — only she can change it (Review screen).
  Suggestions are separate, labelled, and only applied when someone taps "Aplicar".
*/

export type SuggestionStatus = 'pending' | 'applied' | 'dismissed'

export interface Suggestion {
  /** The converted amount, e.g. "≈ 1 cdta" / "about 1 tsp" */
  es: string
  en: string
  /** The exact words the suggestion is based on */
  basedOn: string
  status: SuggestionStatus
}

export interface Note {
  id: string
  question: string
  reply?: string
  askedAt: number
  answeredAt?: number
}

export interface Ingredient {
  id: string
  words: string
  suggestion?: Suggestion
  /** The app could not estimate this amount — it says so instead of guessing */
  unsure?: boolean
}

export interface Step {
  id: string
  words: string
  suggestion?: Suggestion
  unsure?: boolean
  /** A short default question for "Preguntarle a Mamá" */
  askHint: string
  /** Mock reply she sends back when asked (prototype only) */
  mockReply: string
  notes: Note[]
}

export type Tone = 'terracotta' | 'green' | 'yellow'

export interface Recipe {
  id: string
  dish: string
  /** Recipe holder, as the family calls her */
  from: string
  sharedWith: string[]
  intro: string
  tone: Tone
  ingredients: Ingredient[]
  steps: Step[]
  /** True while a fresh recording is waiting for her review */
  draft?: boolean
}

export interface FamilyMember {
  id: string
  name: string
  relation: string
  role: 'holder' | 'cook'
  pending?: boolean
  isYou?: boolean
}

const s = (es: string, en: string, basedOn: string): Suggestion => ({
  es,
  en,
  basedOn,
  status: 'pending',
})

export const FAMILY_NAME = 'Garza'

export const recipes: Recipe[] = [
  {
    id: 'fideo',
    dish: 'Fideo',
    from: 'Mamá Lupe',
    sharedWith: ['Dani', 'Marcos', 'Sofi'],
    intro:
      'Este es el fideo que les hacía cuando llegaban de la escuela. Nada complicado, mija, nomás no lo dejes solo.',
    tone: 'terracotta',
    ingredients: [
      { id: 'f-i1', words: 'un paquetito de fideo, el delgadito', suggestion: s('≈ 1 paquete (200 g)', 'about 1 package (7 oz)', 'un paquetito') },
      { id: 'f-i2', words: 'un chorrito de aceite', suggestion: s('≈ 2 cdas', 'about 2 tbsp', 'un chorrito') },
      { id: 'f-i3', words: 'dos tomates bien maduros' },
      { id: 'f-i4', words: 'un pedacito de cebolla', suggestion: s('≈ ¼ de cebolla', 'about ¼ onion', 'un pedacito') },
      { id: 'f-i5', words: 'un diente de ajo, o dos si están chiquitos' },
      { id: 'f-i6', words: 'un puñito de comino', suggestion: s('≈ 1 cdta', 'about 1 tsp', 'un puñito') },
      { id: 'f-i7', words: 'consomé de pollo, una cucharada o al gusto', suggestion: s('≈ 1 cda', 'about 1 tbsp', 'una cucharada o al gusto') },
      { id: 'f-i8', words: 'agua, lo que agarre la olla', unsure: true },
    ],
    steps: [
      {
        id: 'f-s1',
        words: 'Primero pones el aceite en la olla, a fuego medio. Not too high porque se te quema el fideo.',
        askHint: '¿Qué tan fuerte la lumbre?',
        mockReply: 'Medio, mija. Que se oiga chirriar tantito cuando le eches el fideo, pero que no eche humo.',
        notes: [],
      },
      {
        id: 'f-s2',
        words: 'Echas el fideo y lo mueves y lo mueves hasta que se vea doradito. No te vayas, eh, que se pasa rápido.',
        askHint: '¿Qué tan doradito?',
        mockReply: 'Como color de cacahuate. Si ya huele a tostado, ya está. Si se pone oscuro, ya se te pasó.',
        notes: [],
      },
      {
        id: 'f-s3',
        words: 'Mientras, licúas los tomates con la cebolla, el ajo y un puñito de comino. Un puñito nomás, no le eches mucho.',
        suggestion: s('≈ 1 cdta de comino', 'about 1 tsp cumin', 'un puñito'),
        askHint: '¿Cuánto comino?',
        mockReply: 'Como una cucharadita, mija. Lo que te quepa en la palma bien cerradita. Si te pasas sabe amargo.',
        notes: [],
      },
      {
        id: 'f-s4',
        words: 'Le echas lo licuado al fideo, cuidado que brinca. Lo dejas que se fría un ratito hasta que cambie de color.',
        askHint: '¿Cuánto es un ratito?',
        mockReply: 'Unos dos o tres minutos. Se pone más oscurito el tomate, ya no se ve rosa.',
        notes: [],
      },
      {
        id: 'f-s5',
        words: 'Le pones el agua, lo que agarre la olla, y el consomé al gusto. Pruébale.',
        unsure: true,
        askHint: '¿Cuánta agua le pongo?',
        mockReply: 'Que tape el fideo y un dedo más arriba. Como tres tazas en la olla mediana.',
        notes: [],
      },
      {
        id: 'f-s6',
        words: 'Lo tapas y lo bajas a fuego lento como unos quince minutos, hasta que el fideo esté suavecito. Si se seca mucho le pones otro chorrito de agua.',
        askHint: '¿Cómo sé que ya está?',
        mockReply: 'Cuando ya no tiene agüita abajo y el fideo está suave. Que quede caldosito, no seco.',
        notes: [],
      },
    ],
  },
  {
    id: 'picadillo',
    dish: 'Picadillo',
    from: 'Mamá Lupe',
    sharedWith: ['Dani', 'Marcos'],
    intro: 'Con tortillas de harina recién hechas. Así se lo comía tu papá todos los martes.',
    tone: 'green',
    ingredients: [
      { id: 'p-i1', words: 'una libra de carne molida' },
      { id: 'p-i2', words: 'dos o tres papas, depende del tamaño', suggestion: s('≈ 2 papas medianas', 'about 2 medium potatoes', 'dos o tres, depende del tamaño') },
      { id: 'p-i3', words: 'un pedazo de cebolla', suggestion: s('≈ ½ cebolla', 'about ½ onion', 'un pedazo') },
      { id: 'p-i4', words: 'un tomate picadito' },
      { id: 'p-i5', words: 'una pizca de ajo en polvo si no tienes ajo', suggestion: s('≈ ⅛ cdta', 'about ⅛ tsp', 'una pizca') },
      { id: 'p-i6', words: 'comino y pimienta, lo que agarre con la mano', unsure: true },
      { id: 'p-i7', words: 'sal al gusto' },
      { id: 'p-i8', words: 'un vaso de agua', suggestion: s('≈ 1 taza', 'about 1 cup', 'un vaso') },
    ],
    steps: [
      {
        id: 'p-s1',
        words: 'Doras la carne en el sartén grandote, sin aceite, porque la carne suelta su grasa.',
        askHint: '¿Qué sartén uso?',
        mockReply: 'El hondo, el que tiene tapa. Si no tienes, una olla ancha sirve.',
        notes: [],
      },
      {
        id: 'p-s2',
        words: "Cuando ya no esté rosita, le escurres la grasa. Not all of it, déjale poquita pa'l sabor.",
        askHint: '¿Cuánta grasa le dejo?',
        mockReply: 'Como una cucharada. Lo demás lo tiras en una lata, no en el fregadero.',
        notes: [],
      },
      {
        id: 'p-s3',
        words: 'Pelas las papas y las cortas en cuadritos chiquitos, así pa que se cuezan parejo.',
        askHint: '¿Qué tan chiquitos?',
        mockReply: 'Como un dado. Como la uña de tu dedo gordo.',
        notes: [],
      },
      {
        id: 'p-s4',
        words: 'Le echas las papas, la cebolla y el tomate picadito. Lo mueves bien.',
        askHint: '¿Lo tapo?',
        mockReply: 'Todavía no. Nomás muévelo un ratito pa que agarre sabor.',
        notes: [],
      },
      {
        id: 'p-s5',
        words: 'Ahora el comino y la pimienta, lo que agarre con la mano, y sal al gusto. Ajo también.',
        unsure: true,
        askHint: '¿Cuánto comino y pimienta?',
        mockReply: 'Como media cucharadita de cada uno. Mejor poquito y luego le pruebas.',
        notes: [],
      },
      {
        id: 'p-s6',
        words: "Le pones el vaso de agua, lo tapas, y lo dejas hasta que las papas estén blanditas. Pícale con el tenedor pa' ver.",
        suggestion: s('≈ 1 taza de agua', 'about 1 cup water', 'el vaso de agua'),
        askHint: '¿Cuánto tiempo?',
        mockReply: 'Unos veinte minutos a fuego bajito. Si el tenedor entra fácil, ya.',
        notes: [],
      },
    ],
  },
  {
    id: 'arroz-rojo',
    dish: 'Arroz rojo',
    from: 'Abuela Chela',
    sharedWith: ['Mamá Lupe', 'Tía Rosa', 'Dani', 'Marcos', 'Sofi'],
    intro: 'El secreto es no destaparlo. Ya les dije mil veces y nadie me hace caso.',
    tone: 'yellow',
    ingredients: [
      { id: 'a-i1', words: 'una taza de arroz, del largo' },
      { id: 'a-i2', words: 'aceite, un buen chorro', suggestion: s('≈ 3 cdas', 'about 3 tbsp', 'un buen chorro') },
      { id: 'a-i3', words: 'un tomate grande o dos chiquitos' },
      { id: 'a-i4', words: 'un cachito de cebolla', suggestion: s('≈ ¼ de cebolla', 'about ¼ onion', 'un cachito') },
      { id: 'a-i5', words: 'un ajito' },
      { id: 'a-i6', words: 'una cucharada de consomé' },
      { id: 'a-i7', words: 'agua, dos tazas, poquito más', suggestion: s('≈ 2¼ tazas', 'about 2¼ cups', 'dos tazas, poquito más') },
      { id: 'a-i8', words: 'sal, una pizca', suggestion: s('≈ ¼ cdta', 'about ¼ tsp', 'una pizca') },
    ],
    steps: [
      {
        id: 'a-s1',
        words: 'Lavas el arroz y lo escurres bien bien, que no quede mojado, porque si no, no se dora.',
        askHint: '¿Cuántas veces lo lavo?',
        mockReply: 'Hasta que el agua salga clarita. Dos o tres veces.',
        notes: [],
      },
      {
        id: 'a-s2',
        words: 'Calientas el aceite y echas el arroz. Lo mueves hasta que se vea doradito, como color de galleta.',
        askHint: '¿Cuánto tiempo lo doro?',
        mockReply: 'Unos cinco minutos, mijo. Que suene como arenita cuando lo mueves.',
        notes: [],
      },
      {
        id: 'a-s3',
        words: 'Licúas el tomate con la cebolla, el ajito y el consomé, con poquita del agua.',
        askHint: '¿Cuánta agua en la licuadora?',
        mockReply: 'Media taza de las dos. Lo demás lo guardas.',
        notes: [],
      },
      {
        id: 'a-s4',
        words: 'Lo echas al arroz y lo dejas que se fría, hasta que se le seque el caldito.',
        askHint: '¿Cómo sé que ya se secó?',
        mockReply: 'Cuando haces una rayita con la cuchara y no se llena de caldo.',
        notes: [],
      },
      {
        id: 'a-s5',
        words: 'Le pones el resto del agua y la pizca de sal. Cuando suelte el hervor, lo tapas y le bajas toda la lumbre.',
        askHint: '¿Toda la lumbre?',
        mockReply: 'Lo más bajito que tenga tu estufa. Bajito bajito.',
        notes: [],
      },
      {
        id: 'a-s6',
        words: 'Veinte minutos y no lo destapes, eh. Ni lo muevas. Luego lo esponjas con el tenedor.',
        askHint: '¿Y si se pega?',
        mockReply: 'Si se pega es que la lumbre estaba alta. La próxima más bajita. Lo pegadito también se come.',
        notes: [],
      },
    ],
  },
  {
    id: 'caldo-de-res',
    dish: 'Caldo de res',
    from: 'Tía Rosa',
    sharedWith: ['Mamá Lupe', 'Dani', 'Sofi'],
    intro: 'Pa los días de frío, o cuando alguien anda malo. Se hace en la mañana y se come a mediodía.',
    tone: 'green',
    ingredients: [
      { id: 'c-i1', words: 'dos libras de chambarete con hueso' },
      { id: 'c-i2', words: 'una olla de agua, la grande', unsure: true },
      { id: 'c-i3', words: 'un elote partido en tres' },
      { id: 'c-i4', words: 'dos calabacitas' },
      { id: 'c-i5', words: 'una zanahoria o dos' },
      { id: 'c-i6', words: 'medio repollo' },
      { id: 'c-i7', words: 'un manojito de cilantro', suggestion: s('≈ ½ taza picado', 'about ½ cup chopped', 'un manojito') },
      { id: 'c-i8', words: 'cebolla y ajo' },
      { id: 'c-i9', words: 'sal al gusto, y un chile serrano si le gusta picosito' },
    ],
    steps: [
      {
        id: 'c-s1',
        words: 'Pones la carne con agua fría en la olla grande, con la cebolla y el ajo, y sal al gusto.',
        unsure: true,
        askHint: '¿Cuánta agua?',
        mockReply: 'Que tape la carne y como cuatro dedos más. Como tres litros en la olla grande.',
        notes: [],
      },
      {
        id: 'c-s2',
        words: "Cuando hierva le quitas la espumita de arriba con una cuchara. Eso es importante pa' que quede clarito.",
        askHint: '¿Cuántas veces le quito la espuma?',
        mockReply: 'Las primeras veces que hierve. Ya cuando sale blanquita, ya déjalo.',
        notes: [],
      },
      {
        id: 'c-s3',
        words: 'Lo dejas a fuego bajito como dos horas, hasta que la carne se deshaga solita.',
        askHint: '¿Lo tapo?',
        mockReply: 'Medio tapado, que respire. Si se baja mucho el agua le pones más caliente.',
        notes: [],
      },
      {
        id: 'c-s4',
        words: 'Luego le echas el elote y la zanahoria, que son las que tardan más.',
        askHint: '¿Cómo corto la zanahoria?',
        mockReply: 'En pedazos grandes, como de tres dedos. Que se vean en el plato.',
        notes: [],
      },
      {
        id: 'c-s5',
        words: 'A la media hora las calabacitas y el repollo. No las dejes mucho que se deshacen.',
        askHint: '¿Cuánto tiempo las calabacitas?',
        mockReply: 'Diez minutos nomás. Que se puedan picar pero que no se deshagan.',
        notes: [],
      },
      {
        id: 'c-s6',
        words: 'Al último el cilantro y el chile. Sirves con limón, tortillas y arroz.',
        askHint: '¿Le pongo el chile entero?',
        mockReply: 'Entero, pa que dé sabor sin picar mucho. Si quieres que pique, pártelo.',
        notes: [],
      },
    ],
  },
]

/**
 * What the app "hears" from a new recording. In the prototype every recording
 * produces this draft so the Review screen always has something realistic.
 */
export const recordedDraft: Omit<Recipe, 'id'> = {
  dish: 'Frijoles a la charra',
  from: 'Mamá Lupe',
  sharedWith: ['Dani', 'Marcos', 'Sofi'],
  intro: 'Estos son los frijoles de los domingos, cuando venían todos a comer carne asada.',
  tone: 'terracotta',
  draft: true,
  ingredients: [
    { id: 'd-i1', words: 'una olla de frijol pinto ya cocido, con su caldito' },
    { id: 'd-i2', words: 'cuatro o cinco tiras de tocino' },
    { id: 'd-i3', words: 'un pedacito de chorizo', suggestion: s('≈ 85 g', 'about 3 oz', 'un pedacito') },
    { id: 'd-i4', words: 'un tomate, cebolla y un chile serrano' },
    { id: 'd-i5', words: 'un manojito de cilantro', suggestion: s('≈ ¼ taza picado', 'about ¼ cup chopped', 'un manojito') },
    { id: 'd-i6', words: 'comino, una pizquita', suggestion: s('≈ ⅛ cdta', 'about ⅛ tsp', 'una pizquita') },
    { id: 'd-i7', words: 'sal, cuando ya esté, al gusto' },
    { id: 'd-i8', words: 'caldo de los frijoles, lo que pida', unsure: true },
  ],
  steps: [
    {
      id: 'd-s1',
      words: 'Picas el tocino en cuadritos y lo fríes en la olla hasta que esté doradito, crujientito.',
      askHint: '¿Le pongo aceite?',
      mockReply: 'No, el tocino suelta su grasa solito. Nomás a fuego medio.',
      notes: [],
    },
    {
      id: 'd-s2',
      words: 'Le echas el chorizo y lo desbaratas con la cuchara. Ahí mismo la cebolla, el tomate y el chile, todo picadito.',
      askHint: '¿Saco la grasa?',
      mockReply: 'Si es mucha, quítale tantita. Pero esa grasa es la que da el sabor.',
      notes: [],
    },
    {
      id: 'd-s3',
      words: 'Cuando la cebolla se vea transparente, le echas los frijoles con su caldo, lo que pida.',
      unsure: true,
      askHint: '¿Cuánto caldo?',
      mockReply: 'Que queden caldositos, como sopa espesita. Si no tienes caldo, agua caliente.',
      notes: [],
    },
    {
      id: 'd-s4',
      words: 'Una pizquita de comino y lo dejas hervir despacito una media hora pa que se junten los sabores.',
      suggestion: s('≈ ⅛ cdta de comino', 'about ⅛ tsp cumin', 'una pizquita'),
      askHint: '¿Lo tapo?',
      mockReply: 'Destapado, pa que espese tantito.',
      notes: [],
    },
    {
      id: 'd-s5',
      words: 'Al último el cilantro y la sal al gusto. Pruébales, que siempre les falta sal.',
      askHint: '¿Cuánta sal?',
      mockReply: 'Empieza con una cucharadita y le vas probando. Depende del tocino.',
      notes: [],
    },
  ],
}

export const family: FamilyMember[] = [
  { id: 'm1', name: 'Mamá Lupe', relation: 'Mamá', role: 'holder' },
  { id: 'm2', name: 'Abuela Chela', relation: 'Abuela', role: 'holder' },
  { id: 'm3', name: 'Tía Rosa', relation: 'Tía', role: 'holder' },
  { id: 'm4', name: 'Dani', relation: 'Hija', role: 'cook', isYou: true },
  { id: 'm5', name: 'Marcos', relation: 'Hijo', role: 'cook' },
  { id: 'm6', name: 'Sofi', relation: 'Prima', role: 'cook' },
]
