export interface RevisionChapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  summary: string;
  keyPoints: string[];
  keyFormulasOrRules?: string[];
  examTip: string;
  sampleQuestion: string;
}

export const GET_REVISION_CHAPTERS = (subject: string, grade: string): RevisionChapter[] => {
  const normSubject = subject.toLowerCase().trim();
  const isPrimary = grade === 'CM1' || grade === 'CM2';

  // --- FRANCAIS (CM1 / CM2) ---
  if (isPrimary && (normSubject.includes('francais') || normSubject.includes('français'))) {
    return [
      {
        id: 'cm_fr_1',
        number: 1,
        title: 'Exploitation de texte 1 : Vocabulaire',
        subtitle: 'Les synonymes, antonymes et familles de mots',
        summary: 'Dans ce volet, vous apprenez à enrichir votre vocabulaire. Les synonymes sont des mots qui ont le même sens (ex: joyeux = content). Les antonymes sont des mots de sens contraire (ex: grand / petit). Les mots d\'une même famille partagent le même radical (ex: terre, terrain, terrasser).',
        keyPoints: [
          'Synonyme = Sens identique ou très voisin.',
          'Antonyme = Sens exactement opposé.',
          'Radical = La partie commune qui donne le sens principal aux mots d\'une famille.',
          'Suffixes et préfixes permettent de former de nouveaux mots.'
        ],
        keyFormulasOrRules: [
          'Règle : Un synonyme ou antonyme conserve la même nature grammaticale (un nom a pour synonyme un nom, un verbe un verbe).',
          'Règle du radical : Garder la racine intacte lors de la dérivation.'
        ],
        examTip: 'Au CEPE, repérez bien le contexte de la phrase avant de donner un synonyme ou un contraire.',
        sampleQuestion: 'Donne deux synonymes du mot "demeure" et forme deux mots de la famille de "chant".'
      },
      {
        id: 'cm_fr_2',
        number: 2,
        title: 'Exploitation de texte 1 : Orthographe',
        subtitle: 'Accords, homophones et règles d\'écriture',
        summary: 'L\'orthographe exige l\'accord correct de l\'adjectif qualificatif en genre et en nombre avec le nom qu\'il qualifie, ainsi que la maîtrise des homophones grammaticaux (a/à, est/et, son/sont, ce/se).',
        keyPoints: [
          'a (verbe avoir) / à (préposition) -> Remplacez par "avait".',
          'est (verbe être) / et (conjonction) -> Remplacez par "était" ou "et puis".',
          'son (possessif) / sont (verbe être) -> Remplacez par "étaient".',
          'L\'adjectif qualificatif s\'accorde en genre (masculin/féminin) et nombre (singulier/pluriel).'
        ],
        keyFormulasOrRules: [
          'Astuce : Si l\'on peut dire "avait", écrivez "a" sans accent.',
          'Astuce : Si l\'on peut dire "était", écrivez "est".'
        ],
        examTip: 'Relisez toujours votre dictée en vérifiant la chaîne d\'accord du sujet au verbe.',
        sampleQuestion: 'Complète par "a" ou "à" : Paul ... donné un livre ... son petit frère.'
      },
      {
        id: 'cm_fr_3',
        number: 3,
        title: 'Exploitation de texte 2 : Grammaire',
        subtitle: 'Les types et formes de phrases, sujet et groupe nominal',
        summary: 'La grammaire étude la structure de la phrase. On distingue 4 types de phrases (déclarative, interrogative, exclamative, impérative) et 2 formes (affirmative et négative). Le groupe nominal sujet (GNS) indique qui fait l\'action.',
        keyPoints: [
          'Type déclaratif (.) : Raconte ou donne une information.',
          'Type interrogatif (?) : Pose une question.',
          'Type exclamatif (!) : Exprime un sentiment fort.',
          'Forme négative : Utilise "ne... pas", "ne... plus", "ne... jamais".'
        ],
        keyFormulasOrRules: [
          'Pour trouver le sujet, posez la question : "Qui est-ce qui... ?" ou "Qu\'est-ce qui... ?" devant le verbe.'
        ],
        examTip: 'Au CEPE, n\'oubliez jamais la majuscule au début et le point final correspondant au type de phrase.',
        sampleQuestion: 'Transforme la phrase affirmative "Le maître explique la leçon." à la forme négative.'
      },
      {
        id: 'cm_fr_4',
        number: 4,
        title: 'Exploitation de texte 2 : Conjugaison',
        subtitle: 'Présent, Imparfait, Futur et Passé Simple',
        summary: 'La conjugaison enseigne les terminaisons des verbes selon les temps. Au présent, les verbes du 1er groupe prennent -e, -es, -e, -ons, -ez, -ent. À l\'imparfait, les terminaisons sont toujours -ais, -ais, -ait, -ions, -iez, -aient.',
        keyPoints: [
          'Présent : Indique une action qui se déroule au moment où l\'on parle.',
          'Imparfait : Temps du passé pour décrire ou indiquer une habitude.',
          'Futur simple : Indique une action à venir (-rai, -ras, -ra, -rons, -rez, -ront).',
          'Passé simple : Temps du passé pour une action soudaine et terminée.'
        ],
        keyFormulasOrRules: [
          'Terminaisons Imparfait : -ais, -ais, -ait, -ions, -iez, -aient pour TOUS les verbes.',
          'Terminaisons Futur : Radical du verbe + -ai, -as, -a, -ons, -ez, -ont.'
        ],
        examTip: 'Repérez l\'indicateur de temps dans la phrase (hier, aujourd\'hui, demain) pour choisir le bon temps.',
        sampleQuestion: 'Conjugue le verbe "finir" à l\'imparfait de l\'indicatif à toutes les personnes.'
      }
    ];
  }

  // --- MATHEMATIQUES ---
  if (normSubject.includes('math')) {
    if (grade === '3ème') {
      return [
        {
          id: 'm3_1',
          number: 1,
          title: 'Équations et Inéquations du 1er degré',
          subtitle: 'Résolution algébrique, représentations et problèmes',
          summary: 'Une équation du 1er degré est une égalité contenant une inconnue x (ax + b = 0). Une inéquation utilise les symboles <, >, ≤, ≥. Les règles de simplification consistent à isoler x en appliquant les opérations inverses.',
          keyPoints: [
            'Équation ax + b = 0 -> x = -b / a (si a ≠ 0).',
            'Inéquation : Lorsqu\'on multiplie ou divise par un nombre négatif, le sens de l\'inégalité CHANGE.',
            'Équation produit nul : A × B = 0 signifie A = 0 ou B = 0.',
            'Représentation des solutions d\'une inéquation sur une droite graduée.'
          ],
          keyFormulasOrRules: [
            'Si a > 0 : ax < b => x < b/a',
            'Si a < 0 : ax < b => x > b/a (Inversion du signe !)',
            '(a + b)(a - b) = a² - b²'
          ],
          examTip: 'Au BEPC, n\'oubliez jamais de vérifier vos solutions et de conclure par un ensemble de solutions S = {...}.',
          sampleQuestion: 'Rousous dans ℝ l\'équation : (2x - 3)(x + 5) = 0 et l\'inéquation : -3x + 6 ≤ 0.'
        },
        {
          id: 'm3_2',
          number: 2,
          title: 'Propriété de Thalès et Réciproque',
          subtitle: 'Calcul de longueurs et démonstration de parallélisme',
          summary: 'Dans un triangle ABC avec M ∈ [AB] et N ∈ [AC], si (MN) // (BC), alors AM/AB = AN/AC = MN/BC. La réciproque permet de démontrer que deux droites sont parallèles si les rapports sont égaux et les points alignés dans le même ordre.',
          keyPoints: [
            'Conditions de la propriété : Droites parallèles et points alignés.',
            'Usage direct : Calculer la longueur d\'un côté inconnu.',
            'Usage de la réciproque : Prouver le parallélisme de deux droites.',
            'Vérifier l\'ordre des points alignés sur les deux droites.'
          ],
          keyFormulasOrRules: [
            'Rapport de Thalès : AM / AB = AN / AC = MN / BC',
            'Produit en croix : AM × BC = AB × MN'
          ],
          examTip: 'Rédigez toujours en citant les conditions : "Dans le triangle ABC, M ∈ [AB], N ∈ [AC] et les droites (MN) et (BC) sont parallèles..."',
          sampleQuestion: 'Soit un triangle ABC avec AB = 6 cm, AC = 8 cm. M ∈ [AB] tel que AM = 2 cm. Calcule AN si (MN) // (BC).'
        },
        {
          id: 'm3_3',
          number: 3,
          title: 'Calcul Littéral et Identités Remarquables',
          subtitle: 'Développement, factorisation et réductions',
          summary: 'Le calcul littéral consiste à manipuler des expressions contenant des lettres. Développer c\'est transformer un produit en somme. Factoriser c\'est transformer une somme en produit.',
          keyPoints: [
            'Identité 1 : (a + b)² = a² + 2ab + b²',
            'Identité 2 : (a - b)² = a² - 2ab + b²',
            'Identité 3 : (a + b)(a - b) = a² - b²',
            'Factorisation par recherche d\'un facteur commun ou utilisation de a² - b².'
          ],
          keyFormulasOrRules: [
            '(a + b)² = a² + 2ab + b²',
            '(a - b)² = a² - 2ab + b²',
            'a² - b² = (a - b)(a + b)'
          ],
          examTip: 'Attention aux signes négatifs devant des parenthèses lors du développement !',
          sampleQuestion: 'Développe et réduis E = (3x - 4)² - (x + 2)², puis factorise E.'
        },
        {
          id: 'm3_4',
          number: 4,
          title: 'Racines Carrées et Propriétés',
          subtitle: 'Calculs sur les radicaux et simplification',
          summary: 'La racine carrée d\'un nombre réel positif a est le nombre réel positif dont le carré est égal à a, noté √a.',
          keyPoints: [
            '√(a × b) = √a × √b (pour a ≥ 0 et b ≥ 0).',
            '√(a / b) = √a / √b (pour a ≥ 0 et b > 0).',
            'Attention : √(a + b) ≠ √a + √b !',
            'Écriture sous la forme a√b avec b le plus petit entier possible.'
          ],
          keyFormulasOrRules: [
            '(√a)² = a',
            '√(a²) = |a| = a (si a ≥ 0)',
            'Rendre rationnel un dénominateur : 1/√a = √a / a'
          ],
          examTip: 'Simplifiez toujours vos radicaux sous la forme a√b avant de rendre votre copie.',
          sampleQuestion: 'Écris A = √75 - 2√12 + 3√27 sous la forme a√3 où a est un entier.'
        },
        {
          id: 'm3_5',
          number: 5,
          title: 'Fonctions Affines et Fonctions Linéaires',
          subtitle: 'Définitions, représentations graphiques et coefficient directeur',
          summary: 'Une fonction affine est définie par f(x) = ax + b. Si b = 0, f(x) = ax est une fonction linéaire (droite passant par l\'origine). La représentation graphique d\'une fonction affine est une droite.',
          keyPoints: [
            'a = coefficient directeur (pente) de la droite.',
            'b = ordonnée à l\'origine.',
            'Calcul du coefficient a : a = (f(x2) - f(x1)) / (x2 - x1).',
            'Intersection avec l\'axe des ordonnées : (0, b).'
          ],
          keyFormulasOrRules: [
            'f(x) = ax + b (Affine)',
            'f(x) = ax (Linéaire)',
            'a = (yB - yA) / (xB - xA)'
          ],
          examTip: 'Pour tracer la droite représentant f(x), calculez les coordonnées de 2 points distincts.',
          sampleQuestion: 'Détermine la fonction affine f telle que f(2) = 5 et f(4) = 11.'
        },
        {
          id: 'm3_6',
          number: 6,
          title: 'Trigonométrie dans le Triangle Rectangle',
          subtitle: 'Cosinus, Sinus, Tangente et applications',
          summary: 'Dans un triangle rectangle, les rapports trigonométriques associent la mesure d\'un angle aigu aux longueurs des côtés du triangle.',
          keyPoints: [
            'Moyen mnémotechnique : SOH CAH TOA.',
            'Sinus = Côté Opposé / Hypoténuse.',
            'Cosinus = Côté Adjacent / Hypoténuse.',
            'Tangente = Côté Opposé / Côté Adjacent = Sinus / Cosinus.'
          ],
          keyFormulasOrRules: [
            'cos²(α) + sin²(α) = 1',
            'tan(α) = sin(α) / cos(α)',
            '0 < cos(α) < 1 et 0 < sin(α) < 1'
          ],
          examTip: 'Vérifiez que votre calculatrice est bien réglée en DEG (degrés) !',
          sampleQuestion: 'Soit ABC un triangle rectangle en A avec BC = 10 cm et B = 30°. Calcule AC et AB.'
        }
      ];
    } else if (grade.includes('2nde') || grade.includes('1ère') || grade.includes('Terminale')) {
      return [
        {
          id: 'm_lycee_1',
          number: 1,
          title: 'Généralités sur les Fonctions & Domaines de Définition',
          subtitle: 'Ensemble de définition, parité et variations',
          summary: 'L\'ensemble de définition Df est l\'ensemble des réels x pour lesquels f(x) existe. Une fonction f est paire si Df est symétrique par rapport à 0 et f(-x) = f(x). Elle est impaire si f(-x) = -f(x).',
          keyPoints: [
            'Dénominateur ≠ 0.',
            'Expression sous la racine carrée ≥ 0.',
            'Expression dans Ln > 0.',
            'Axe de symétrie et centre de symétrie d\'une courbe.'
          ],
          keyFormulasOrRules: [
            'Parité : f(-x) = f(x) (Paire, symétrie Oy)',
            'Parité : f(-x) = -f(x) (Impaire, symétrie O)',
            'Centre de symétrie I(a,b) : f(2a - x) + f(x) = 2b'
          ],
          examTip: 'Au BAC, justifiez toujours l\'ensemble de définition avant de calculer des limites.',
          sampleQuestion: 'Détermine Df pour f(x) = (2x + 1) / √(x² - 4).'
        },
        {
          id: 'm_lycee_2',
          number: 2,
          title: 'Limites et Continuité d\'une Fonction',
          subtitle: 'Calculs de limites, formes indéterminées et asymptotes',
          summary: 'Les limites étudient le comportement de f(x) aux bornes du domaine de définition. Les 4 formes indéterminées classiques sont : "0/0", "∞/∞", "0 × ∞", "+∞ - ∞".',
          keyPoints: [
            'Asymptote verticale : lim x->a f(x) = ±∞ (x = a).',
            'Asymptote horizontale : lim x->±∞ f(x) = b (y = b).',
            'Asymptote oblique y = ax + b : lim x->±∞ [f(x) - (ax + b)] = 0.',
            'Théorème des Valeurs Intermédiaires (TVI) pour montrer l\'existence d\'une solution.'
          ],
          keyFormulasOrRules: [
            'Limites usuelles : lim x->0 (sin x)/x = 1',
            'Limites usuelles : lim x->+∞ (ln x)/x = 0',
            'Limites usuelles : lim x->+∞ (e^x)/x = +∞'
          ],
          examTip: 'Levée d\'indétermination : factorisez par le terme de plus haut degré ou utilisez l\'expression conjuguée.',
          sampleQuestion: 'Calcule lim x->+∞ [√(x² + 3x) - x] et interprète le résultat.'
        },
        {
          id: 'm_lycee_3',
          number: 3,
          title: 'Dérivation et Étude des Variations',
          subtitle: 'Nombre dérivé, règles de dérivation et tableau de variations',
          summary: 'La dérivée f\'(x) donne la pente de la tangente à la courbe en un point. Le signe de f\'(x) détermine le sens de variation de f.',
          keyPoints: [
            'Si f\'(x) > 0 sur un intervalle, f est strictement croissante.',
            'Si f\'(x) < 0 sur un intervalle, f est strictement décroissante.',
            'Équation de la tangente au point d\'abscisse x0 : y = f\'(x0)(x - x0) + f(x0).',
            'Maximum / Minimum local lorsque f\'(x) s\'annule en changeant de signe.'
          ],
          keyFormulasOrRules: [
            '(uv)\' = u\'v + uv\'',
            '(u/v)\' = (u\'v - uv\') / v²',
            '(u^n)\' = n × u\' × u^(n-1)',
            '(e^u)\' = u\' × e^u | (ln u)\' = u\' / u'
          ],
          examTip: 'Vérifiez toujours la cohérence entre le signe de f\'(x) et les limites dans le tableau de variations.',
          sampleQuestion: 'Calcule la dérivée de f(x) = (3x - 2)e^(-x) et dresse son tableau de variations.'
        },
        {
          id: 'm_lycee_4',
          number: 4,
          title: 'Fonctions Logarithme (Ln) & Exponentielle (Exp)',
          subtitle: 'Propriétés algébriques, équations et limites de croissance comparée',
          summary: 'La fonction exp(x) est la bijecion réciproque de ln(x). Ln est définie sur ]0, +∞[ et Exp sur ℝ.',
          keyPoints: [
            'ln(a × b) = ln(a) + ln(b)',
            'ln(a / b) = ln(a) - ln(b)',
            'ln(a^n) = n × ln(a)',
            'e^(a+b) = e^a × e^b et e^(-a) = 1 / e^a'
          ],
          keyFormulasOrRules: [
            'e^(ln x) = x (pour x > 0)',
            'ln(e^x) = x (pour tout x ∈ ℝ)',
            'ln(1) = 0, ln(e) = 1, e^0 = 1'
          ],
          examTip: 'Dans les équations avec Ln, posez d\'abord le domaine de validité avant de résoudre.',
          sampleQuestion: 'Résous dans ℝ l\'équation : e^(2x) - 3e^x + 2 = 0.'
        }
      ];
    }
  }

  // --- FRANCAIS (Collège & Lycée) ---
  if (normSubject.includes('francais') || normSubject.includes('français')) {
    return [
      {
        id: 'fr_1',
        number: 1,
        title: 'Le Résumé de Texte Argumentatif',
        subtitle: 'Techniques de contraction, repérage de la thèse et réécriture',
        summary: 'Le résumé de texte argumentatif consiste à réduire un texte au quart de sa longueur initiale (±10%) en conservant fidèlement l\'enchaînement logique des idées de l\'auteur, sans émettre d\'avis personnel.',
        keyPoints: [
          'Dégager la thèse défendue par l\'auteur et les arguments principaux.',
          'Éliminer les exemples illustratifs, répétitions et anecdotes.',
          'Conserver les connecteurs logiques (mais, donc, en effet, cependant).',
          'Rédiger avec vos propres mots (ne pas copier-coller les phrases du texte).'
        ],
        keyFormulasOrRules: [
          'Formule de comptage : Longueur initiale / 4 = Nombre de mots cible (marge autorisée de ±10%).',
          'Interdiction absolue d\'employer le "je" si l\'auteur ne l\'emploie pas.'
        ],
        examTip: 'Au BEPC et au BAC, indiquez toujours le nombre exact de mots utilisés à la fin de votre résumé.',
        sampleQuestion: 'Explique la différence entre une idée essentielle et un exemple illustratif dans un texte argumentatif.'
      },
      {
        id: 'fr_2',
        number: 2,
        title: 'La Dissertation Littéraire',
        subtitle: 'Analyse du sujet, problématisation et plan structuré',
        summary: 'La dissertation est un exercice d\'argumentation organisée répondant à une citation ou une problématique littéraire. Elle comprend une introduction rédigée en 4 étapes, un développement en 2 ou 3 parties et une conclusion.',
        keyPoints: [
          'Introduction : Amorce (A), Citation/Sujet (S), Problématique (P), Annonce du plan (A).',
          'Plan dialectique : Thèse (I), Antithèse (II), Synthèse (III).',
          'Plan thématique : Regroupement par grands axes d\'analyse.',
          'Chaque paragraphe doit contenir : Un argument + Une explication + Un exemple littéraire précis.'
        ],
        keyFormulasOrRules: [
          'Structure d\'un paragraphe : Idée (I) -> Explication (E) -> Illustration/Exemple littéraire (I).'
        ],
        examTip: 'Apprenez par cœur des citations littéraires d\'auteurs africains (Léopold Sédar Senghor, Aimé Césaire, Ahmadou Kourouma).',
        sampleQuestion: 'Rédige une introduction complète pour le sujet : "La littérature doit-elle être engagée au service de la société ?"'
      },
      {
        id: 'fr_3',
        number: 3,
        title: 'Le Commentaire Composé',
        subtitle: 'Analyse stylistique, centres d\'intérêt et procédés littéraires',
        summary: 'Le commentaire composé consiste à analyser un texte littéraire pour en expliquer le sens profond à travers la forme (figures de style, champ lexical, temps verbaux, rythme).',
        keyPoints: [
          'Ne jamais séparer le fond (ce qui est dit) de la forme (comment c\'est dit).',
          'Définir 2 ou 3 axes de lecture (centres d\'intérêt).',
          'Relever les champs lexicaux, figures de style et tournures grammaticales.',
          'Rédiger des transitions claires entre chaque partie.'
        ],
        keyFormulasOrRules: [
          'Formule d\'analyse : Relevé de texte + Identification du procédé + Effet produit sur le lecteur.'
        ],
        examTip: 'Évitez le piège de la paraphrase : ne racontez pas l\'histoire, analysez l\'écriture de l\'auteur.',
        sampleQuestion: 'Identifie la figure de style dans : "Cette obscure clarté qui tombe des étoiles" et explique son effet.'
      }
    ];
  }

  // --- PHYSIQUE-CHIMIE ---
  if (normSubject.includes('physique') || normSubject.includes('pc') || normSubject.includes('chimie')) {
    return [
      {
        id: 'pc_1',
        number: 1,
        title: 'Poids, Masse et Gravité',
        subtitle: 'Relation P = m × g, dynamomètre et intensité de pesanteur',
        summary: 'Le poids P est la force d\'attraction exercée par la Terre sur un corps. C\'est une grandeur vectorielle s\'exprimant en Newtons (N). La masse m est la quantité de matière du corps, constante en tout lieu, mesurée en kg.',
        keyPoints: [
          'Poids P (en Newtons N) : Variable selon le lieu.',
          'Masse m (en Kilogrammes kg) : Invariable.',
          'Intensité de pesanteur g (en N/kg) : Environ 9,8 N/kg ou 10 N/kg en Côte d\'Ivoire.',
          'Instrument de mesure du poids : Le dynamomètre.'
        ],
        keyFormulasOrRules: [
          'P = m × g',
          'm = P / g',
          'g = P / m'
        ],
        examTip: 'Attention aux unités : convertissez toujours la masse en kg avant de calculer le poids !',
        sampleQuestion: 'Un objet a une masse de 500 g. Calcule son poids sur Terre où g = 10 N/kg.'
      },
      {
        id: 'pc_2',
        number: 2,
        title: 'Solutions Aqueuses, Acides et Bases (pH)',
        subtitle: 'Échelle de pH, ions H+ et OH-, neutralisation',
        summary: 'Une solution aqueuse est un mélange homogène dont le solvant est l\'eau. Le pH varie de 0 à 14 et indique la concentration en ions hydrogène H+.',
        keyPoints: [
          'pH < 7 : Solution ACIDE (Prédominance d\'ions H+).',
          'pH = 7 : Solution NEUTRE ([H+] = [OH-]).',
          'pH > 7 : Solution BASIQUE (Prédominance d\'ions OH-).',
          'Mesure du pH : Papier pH ou pH-mètre.',
          'La réaction entre un acide fort et une base forte produit de l\'eau et un sel (réaction exothermique).'
        ],
        keyFormulasOrRules: [
          'pH = -log[H3O+]',
          'Dilution : C1 × V1 = C2 × V2 (Conservation de la quantité de matière)'
        ],
        examTip: 'Règle de sécurité : Lors d\'une dilution, versez toujours l\'acide dans l\'eau et jamais l\'inverse !',
        sampleQuestion: 'Une solution A a un pH de 3. Est-elle acide ou basique ? Que devient son pH si on y ajoute de l\'eau distillée ?'
      },
      {
        id: 'pc_3',
        number: 3,
        title: 'Électricité : Tension, Intensité et Loi d\'Ohm',
        subtitle: 'Circuits électriques, voltmètre, ampèremètre et résistance',
        summary: 'L\'intensité I du courant électrique (en Ampères A) se mesure avec un ampèremètre branché en SÉRIE. La tension U (en Volts V) se mesure avec un voltmètre branché en DÉRIVATION.',
        keyPoints: [
          'Loi d\'Ohm pour un conducteur ohmique : U = R × I.',
          'Loi des nœuds : La somme des intensités arrivant à un nœud est égale à la somme des intensités qui en sortent.',
          'Loi des mailles : Dans une maille, la tension du générateur est égale à la somme des tensions des récepteurs.',
          'Association de résistances en série : R_éq = R1 + R2.'
        ],
        keyFormulasOrRules: [
          'U = R × I (Loi d\'Ohm)',
          'P = U × I (Puissance électrique en Watts W)',
          'E = P × t (Énergie électrique en Joules J ou kWh)'
        ],
        examTip: 'Un ampèremètre a une résistance très faible et doit impérativement être placé en série.',
        sampleQuestion: 'Un conducteur ohmique de résistance R = 100 Ω est traversé par un courant de 0,2 A. Calcule la tension à ses bornes.'
      }
    ];
  }

  // --- SVT ---
  if (normSubject.includes('svt') || normSubject.includes('biologie') || normSubject.includes('terre')) {
    return [
      {
        id: 'svt_1',
        number: 1,
        title: 'Digestion et Absorption Intestinale',
        subtitle: 'Transformations mécaniques, chimiques et rôle des enzymes',
        summary: 'La digestion transforme les aliments complexes en nutriments simples utilisables par les cellules. Elle combine des actions mécaniques (mastication, brassage) et chimiques (enzymes digestives).',
        keyPoints: [
          'Aliments complexes (amidon, protéines, lipides) -> Nutriments (glucose, acides aminés, acides gras).',
          'Enzymes : Salivaire (amylase), gastrique (pépse), pancréatique et intestinale.',
          'Lieu de l\'absorption intestinale : L\'intestin grêle grâce à ses villosités intestinales.',
          'Passage des nutriments dans le sang (glucose, acides aminés) et la lymphe (lipides).'
        ],
        keyFormulasOrRules: [
          'Amidon + Amylase (37°C) -> Maltose + Glucose',
          'Test à la liqueur de Fehling à chaud -> Précipité rouge brique (Présence de sucre réducteur).'
        ],
        examTip: 'N\'oubliez pas de préciser la température du corps humain (37°C) nécessaire à l\'action enzymatique.',
        sampleQuestion: 'Décris l\'expérience prouvant l\'action de la salive sur l\'amidon cuit.'
      },
      {
        id: 'svt_2',
        number: 2,
        title: 'Circulation Sanguine et Système Immunitaire',
        subtitle: 'Cœur, vaisseaux sanguins, hématose et défense de l\'organisme',
        summary: 'Le sang transporte l\'oxygène O2 et les nutriments aux organes, et élimine le CO2 et les déchets. La défense immunitaire implique les leucocytes (lymphocytes T, B et phagocytes).',
        keyPoints: [
          'Petite circulation (pulmonaire) : Cœur -> Poumons (enrichissement en O2) -> Cœur.',
          'Grande circulation (générale) : Cœur -> Organes -> Cœur.',
          'Phagocytose : Ingestion et destruction rapide du microbe par les polynucléaires.',
          'Immunité spécifique : Lymphocytes B (sécrétion d\'anticorps) et Lymphocytes T8 (cytotoxiques).'
        ],
        keyFormulasOrRules: [
          'Antigène + Anticorps spécifique -> Complexe immun (Neutralisation du microbe).'
        ],
        examTip: 'Distinguez bien la vaccination (préventive, mémoire immunitaire) de la sérothérapie (curative, immédiate).',
        sampleQuestion: 'Explique le rôle des lymphocytes B lors d\'une infection bactérienne.'
      },
      {
        id: 'svt_3',
        number: 3,
        title: 'Tectonique des Plaques et Géologie',
        subtitle: 'Dérive des continents, séismes, volcanisme et orogenèse',
        summary: 'La lithosphère terrestre est découpée en plaques rigides mobiles qui flottent sur l\'asthénosphère. Leurs mouvements provoquent l\'ouverture des océans, les séismes et les éruptions volcaniques.',
        keyPoints: [
          'Mouvements de divergence (dorsales océaniques) : Écartement et création de plancher océanique.',
          'Mouvements de convergence (zones de subduction) : Enfoncement d\'une plaque sous une autre.',
          'Séisme : Libération brutale d\'énergie au foyer provoquée par la rupture de roches en profondeur.',
          'Volcanisme effusif (basaltique) vs Volcanisme explosif (andésitique).'
        ],
        keyFormulasOrRules: [
          'Vitesse de déplacement des plaques : v = d / t (de l\'ordre de quelques cm par an).'
        ],
        examTip: 'Utilisez un schéma légendé montrant le foyer, l\'épicentre et la propagation des ondes sismiques.',
        sampleQuestion: 'Quelle est la différence entre le foyer et l\'épicentre d\'un séisme ?'
      }
    ];
  }

  // --- HISTOIRE-GEOGRAPHIE ---
  if (normSubject.includes('hist') || normSubject.includes('géo') || normSubject.includes('geo')) {
    return [
      {
        id: 'hg_1',
        number: 1,
        title: 'Histoire : La Deuxième Guerre Mondiale (1939-1945)',
        subtitle: 'Origines, grandes étapes et bilan de la guerre',
        summary: 'Le conflit le plus meurtrier de l\'histoire humaine opposant les Alliés (USA, URSS, Royaume-Uni, France) aux forces de l\'Axe (Allemagne, Italie, Japon). Il s\'achève en 1945 par la capitulation nazie et le lancement des bombes atomiques sur Hiroshima et Nagasaki.',
        keyPoints: [
          'Origines : Traité de Versailles, expansionnisme hitlérien et faiblesse de la SDN.',
          'Tournant de la guerre (1942-1943) : Batailles de Stalingrad, Midway et El Alamein.',
          'Bilan humain et matériel : Plus de 60 millions de morts, découverte des camps d\'extermination.',
          'Création de l\'ONU en octobre 1945 pour maintenir la paix mondiale.'
        ],
        keyFormulasOrRules: [
          'Date clé : 1er Septembre 1939 (Invasion de la Pologne par l\'Allemagne).',
          'Date clé : 8 Mai 1945 (Capitulation allemande) et 2 Septembre 1945 (Capitulation du Japon).'
        ],
        examTip: 'Rappelez le rôle déterminant des tirailleurs africains dans la libération de la France.',
        sampleQuestion: 'Quelles sont les conséquences politiques et territoriales de la Seconde Guerre Mondiale ?'
      },
      {
        id: 'hg_2',
        number: 2,
        title: 'Histoire : Décolonisation & Indépendance de la Côte d\'Ivoire',
        subtitle: 'De la Conférence de Brazzaville à la Proclamation du 7 Août 1960',
        summary: 'L\'émancipation politique de la Côte d\'Ivoire menée par Félix Houphouët-Boigny et le RDA (Rassemblement Démocratique Africain). Elle passe par la suppression du travail forcé (Loi Houphouët-Boigny de 1946) et la Loi-Cadre de 1956.',
        keyPoints: [
          '1944 : Création du Syndicat Agricole Africain (SAA) par Félix Houphouët-Boigny.',
          '1946 : Vote de la loi abolissant le travail forcé dans les colonies françaises.',
          '1958 : Création de la République de Côte d\'Ivoire au sein de la Communauté française.',
          '7 Août 1960 : Proclamation officielle de l\'Indépendance de la Côte d\'Ivoire.'
        ],
        keyFormulasOrRules: [
          'Slogan historique : "La terre à celui qui la met en valeur."'
        ],
        examTip: 'Au BEPC et au BAC, citez les étapes clés du processus d\'émancipation en respectant la chronologie.',
        sampleQuestion: 'Explique l\'importance de la loi du 11 avril 1946 dans la marche vers l\'indépendance de la Côte d\'Ivoire.'
      },
      {
        id: 'hg_3',
        number: 3,
        title: 'Géographie : L\'Économie et l\'Agriculture Ivoirienne',
        subtitle: 'Atouts, cultures de rente, élevage et défis industriels',
        summary: 'La Côte d\'Ivoire est le premier producteur mondial de cacao et d\'anacarde (noix de cajou). Son économie repose principalement sur le secteur agricole, qui emploie une grande partie de la population active.',
        keyPoints: [
          'Cultures d\'exportation (rente) : Cacao, Café, Hévéa, Anacarde, Palmier à huile, Banane.',
          'Cultures vivrières : Yame, Manioc, Riz, Maïs, Banane plantain.',
          'Problèmes de l\'agriculture : Chute des cours mondiaux, changement climatique et vieillissement des vergers.',
          'Défi de l\'industrialisation : Transformer localement les matières premières (agro-industrie).'
        ],
        keyFormulasOrRules: [
          'Poids économique : L\'agriculture représente environ 20% du PIB et plus de 40% des recettes d\'exportation.'
        ],
        examTip: 'Sachez localiser sur une carte de la Côte d\'Ivoire la boucle du cacao et la ceinture de l\'anacarde au Nord.',
        sampleQuestion: 'Quels sont les obstacles à la transformation locale du cacao en Côte d\'Ivoire ?'
      }
    ];
  }

  // --- PHILOSOPHIE ---
  if (normSubject.includes('philo')) {
    return [
      {
        id: 'ph_1',
        number: 1,
        title: 'La Connaissance de l\'Homme : Conscience & Inconscient',
        subtitle: 'Descartes, Freud, la liberté et les limites de la conscience',
        summary: 'La conscience est la faculté mentale permettant à l\'homme de se saisir lui-même et de connaître le monde. Pour Descartes ("Je pense donc je suis"), la conscience définit l\'essence humaine. Pour Freud, l\'esprit est dominé par l\'inconscient (Ça, Moi, Surmoi).',
        keyPoints: [
          'Descartes : Le Cogito cartésien et la certitude d\'exister.',
          'Sartre : L\'existentialisme ("L\'existence précède l\'essence"). L\'homme est condamné à être libre.',
          'Freud : L\'inconscient psychique, les rêves et les actes manqués.',
          'Critique de l\'inconscient par Alain et Sartre : L\'inconscient serait une mauvaise foi ou un refus de responsabilité.'
        ],
        keyFormulasOrRules: [
          'Citation Descartes : "Cogito, ergo sum" (Je pense, donc je suis).',
          'Citation Freud : "Le Moi n\'est pas maître dans sa propre maison."'
        ],
        examTip: 'Au BAC A/C/D, confrontez toujours la thèse de la souveraineté de la conscience aux découvertes de la psychanalyse.',
        sampleQuestion: 'L\'hypothèse de l\'inconscient ruine-t-elle la responsabilité morale de l\'homme ?'
      },
      {
        id: 'ph_2',
        number: 2,
        title: 'La Vie en Société : L\'État, le Droit et la Justice',
        subtitle: 'Machiavel, Rousseau, le contrat social et la légitimité du pouvoir',
        summary: 'L\'État est l\'institution politique souveraine exerçant le pouvoir sur un territoire donné. Rousseau montre que l\'État légitime repose sur le contrat social, où le citoyen renonce à sa liberté naturelle pour acquérir la liberté civile.',
        keyPoints: [
          'État de nature vs État civil : La nécessité des lois pour éviter la violence (Hobbes : "L\'homme est un loup pour l\'homme").',
          'Rousseau : La volonté générale et la souveraineté du peuple.',
          'Machiavel : Le réalisme politique et le maintien du pouvoir ("La fin justifie les moyens").',
          'Marx : L\'État comme instrument de domination de la classe bourgeoise.'
        ],
        keyFormulasOrRules: [
          'Rousseau : "L\'obéissance à la loi qu\'on s\'est prescrite est liberté."',
          'Pascal : "Ne pouvant faire que ce qui est juste fût fort, on a fait que ce qui est fort fût juste."'
        ],
        examTip: 'Distinguez soigneusement la légalité (ce qui est conforme à la loi positive) de la légitimité (ce qui est conforme à la justice morale).',
        sampleQuestion: 'Peut-on concevoir une société sans État ?'
      }
    ];
  }

  // --- GENERIC / FALLBACK FOR OTHER SUBJECTS (EDHC, ANGLAIS, ESPAGNOL, ALLEMAND...) ---
  return [
    {
      id: `${normSubject}_1`,
      number: 1,
      title: `Synthèse de cours : Chapitre 1 - ${subject}`,
      subtitle: `Concepts fondamentaux et définitions clés (${grade})`,
      summary: `Ce chapitre regroupe les notions essentielles du programme officiel de ${subject} pour la classe de ${grade}. Il permet de réviser les principes de base, le vocabulaire technique et les méthodes d'analyse attendues aux examens du MENA.`,
      keyPoints: [
        `Maîtrise de la terminologie essentielle de ${subject}.`,
        `Compréhension des liens logiques entre les notions du programme de ${grade}.`,
        'Capacité à appliquer les cours dans les devoirs et évaluations types.',
        'Mise en pratique au travers de sujets d\'examen récents.'
      ],
      keyFormulasOrRules: [
        'Règle d\'or : Toujours lire attentivement les consignes avant de répondre.',
        'Structurez votre argumentation avec des exemples précis du cours.'
      ],
      examTip: `Soignez la présentation et l'orthographe. En ${grade}, une copie claire et structurée valorise immédiatement vos réponses.`,
      sampleQuestion: `Quels sont les points clés à retenir dans le premier chapitre de ${subject} en ${grade} ?`
    },
    {
      id: `${normSubject}_2`,
      number: 2,
      title: `Synthèse de cours : Chapitre 2 - ${subject}`,
      subtitle: `Méthodologie et applications pratiques (${grade})`,
      summary: `Ce second chapitre approfondit les compétences pratiques. Vous y trouverez les schémas d'analyse, les formules de calcul ou les règles de synthèse exigées par les inspecteurs du MENA.`,
      keyPoints: [
        'Analyse méthodique des documents et des énoncés.',
        'Démonstration pas à pas sans sauter d\'étapes.',
        'Vérification de la cohérence des résultats obtenus.',
        'Rédaction de conclusions claires et synthétiques.'
      ],
      keyFormulasOrRules: [
        'Méthode : Énoncé des hypothèses -> Application -> Conclusion rédigée.'
      ],
      examTip: 'Révisez régulièrement sous forme de petites fiches quotidiennes pour fixer la mémoire à long terme.',
      sampleQuestion: `Comment résoudre les exercices types du chapitre 2 de ${subject} en ${grade} ?`
    }
  ];
};
