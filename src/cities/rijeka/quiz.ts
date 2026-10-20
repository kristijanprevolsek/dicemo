import type { QuizQuestion } from '../types'

// Pitanja se oslanjaju na tekstove priča – kad se priča promijeni, provjeriti i pitanje.
export const quiz: Record<string, QuizQuestion> = {
  'katedrala-sv-vida': {
    question: 'Koja je venecijanska crkva bila uzor katedrali sv. Vida?',
    options: ['Santa Maria della Salute', 'Bazilika sv. Marka', 'San Giorgio Maggiore'],
  },
  'stara-vrata': {
    question: 'Kako se zvalo rimsko naselje na mjestu današnje Rijeke?',
    options: ['Tarsatica', 'Senia', 'Aenona'],
  },
  'gradski-toranj': {
    question: 'Koji je car 1719. proglasio Rijeku slobodnom lukom?',
    options: ['Karlo VI.', 'Franjo Josip I.', 'Josip II.'],
  },
  'kosi-toranj': {
    question: 'Zašto je zvonik Velike crkve nagnut?',
    options: ['Zbog mekanog, nasutog tla', 'Zbog jakog potresa', 'Namjerno je tako sagrađen'],
  },
  'trsatske-stube': {
    question: 'Tko je 1531. dao sagraditi stube prema Trsatu?',
    options: ['Petar Kružić', 'Nikola Zrinski', 'Ivan Frankopan'],
  },
  'gospa-trsatska': {
    question: 'Što su, prema predaji, anđeli 1291. donijeli na Trsat?',
    options: ['Nazaretsku kućicu', 'Kip Majke Božje', 'Crkveno zvono'],
  },
  'trsatska-gradina': {
    question: 'Tko je 1826. kupio i obnovio Trsatsku gradinu?',
    options: ['Laval Nugent', "Gabriele D'Annunzio", 'Robert Whitehead'],
  },
  trznica: {
    question: 'Čime je ukrašeno pročelje riječke ribarnice?',
    options: ['Ribama, rakovima i školjkama', 'Grbovima plemićkih obitelji', 'Likovima svetaca'],
  },
  'hnk-zajc': {
    question: 'Koji je slavni slikar sudjelovao u oslikavanju stropa kazališta?',
    options: ['Gustav Klimt', 'Egon Schiele', 'Vlaho Bukovac'],
  },
  'kapucinska-crkva': {
    question: 'Kojem stilu pripada crkva Gospe Lurdske?',
    options: ['Neogotici', 'Baroku', 'Romanici'],
  },
  'guvernerova-palaca': {
    question: 'Koji se talijanski pjesnik 1919. smjestio u Guvernerovu palaču?',
    options: ["Gabriele D'Annunzio", 'Giosuè Carducci', 'Ugo Foscolo'],
  },
  'molo-longo': {
    question: 'Koliko je otprilike dug Molo longo?',
    options: ['Gotovo 2 km', 'Oko 500 m', 'Oko 5 km'],
  },
  torpedo: {
    question: 'S kojim je inženjerom Ivan Vukić razvio prvi torpedo?',
    options: ['Robert Whitehead', 'Nikola Tesla', 'James Watt'],
  },
}
