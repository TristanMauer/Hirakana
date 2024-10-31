let currentQuizz = 0;
let currentQuizzType = "";
let kana = [];
let correctAnswer = "";
let proposal = document.getElementById("proposal"); // Cast de l'élément
let statut = 0;
document.addEventListener("DOMContentLoaded", () => {
  startQuiz("hiragana");
});
// Fonction générique pour démarrer un quiz
async function startQuiz(type) {
  currentQuizz = 0;
  currentQuizzType = type;
  statut = 0; // Réinitialiser le statut
  const validateButton = document.getElementById("validate");

  if (validateButton) {
    validateButton.disabled = false;
  }

  try {
    const response = await fetch(`${type}.json`);
    if (!response.ok) {
      throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
    }

    if (type === "hiragana") {
      kana = await response.json();
      displayQuizz(type);
    } else if (type === "katakana") {
      kana = await response.json();
      displayQuizz(type);
    }
  } catch (error) {
    console.log("Erreur lors du chargement des données :", error);
  }
}

function displayQuizz() {
  if (proposal && currentQuizz < 20) {
    resetProposalStyle();
    const randomIndex = Math.floor(Math.random() * kana.length);
    const kanaQuizz = kana[randomIndex];
    correctAnswer = kanaQuizz.romanji;
    proposal.textContent = kanaQuizz.kana;
    currentQuizz++;
  } else {
    finQuizz();
  }
}

// Fonction pour réinitialiser le style de la proposition
function resetProposalStyle() {
  proposal.className = ""; // Retirer toutes les classes précédentes
  proposal.classList.add("bleu"); // Ajouter la classe par défaut
}

// Fonction pour terminer le quiz
function finQuizz() {
  const validateButton = document.getElementById("validate");

  if (proposal) {
    proposal.textContent = "Le quiz est fini"; // Fin du quiz
  }

  if (validateButton) {
    validateButton.disabled = true; // Désactiver le bouton
  }
}

// Fonction pour vérifier la réponse
function quizzVerification() {
  let answer = document.getElementById("input-writing");

  if (answer && proposal) {
    if (answer.value === correctAnswer) {
      proposal.className = "";
      proposal.classList.add("green");
      console.log("La réponse est correcte");
    } else {
      proposal.className = "";
      proposal.classList.add("red");
      console.log("La réponse est incorrecte");
    }
  }
}

// Gestion du bouton "Valider"
function skipButton() {
  const validateButton = document.getElementById("validate");

  if (validateButton) {
    validateButton.addEventListener("click", function () {
      if (statut === 0) {
        // Vérifier la réponse
        quizzVerification();
        statut++;
      } else {
        // Passer à la question suivante
        if (currentQuizzType === "hiragana") {
          displayQuizz();
        } else if (currentQuizzType === "katakana") {
          displayQuizz();
        } else if (currentQuizzType === "mixed") {
          displayMixedQuizz();
        }
        statut--; // Réinitialiser le statut
        resetProposalStyle();
      }
    });
  }
}

skipButton(); // Initialiser le bouton

// Charger les hiraganas et katakanas pour le quiz mixte
let mixedQuizz = []; // Tableau pour mélanger hiragana et katakana
let usedIndices = new Set(); // Ensemble pour suivre les indices déjà utilisés

// Fonction pour démarrer le quiz mixte
async function startMixedQuiz() {
  currentQuizz = 0;
  currentQuizzType = "mixed"; // Type mixte
  statut = 0;
  const validateButton = document.getElementById("validate");

  if (validateButton) {
    validateButton.disabled = false;
  }

  try {
    // Charger les deux fichiers en parallèle
    const [hiraganaResponse, katakanaResponse] = await Promise.all([
      fetch("hiragana.json"),
      fetch("katakana.json"),
    ]);

    if (!hiraganaResponse.ok || !katakanaResponse.ok) {
      throw new Error(
        `Erreur lors du chargement des données Hiragana/Katakana`
      );
    }

    // Charger les deux sets de caractères
    hiragana = await hiraganaResponse.json();
    katakana = await katakanaResponse.json();

    // Combiner les deux tableaux dans mixedQuizz
    mixedQuizz = [...hiragana, ...katakana];

    // Mélanger les éléments du tableau
    mixedQuizz = shuffleArray(mixedQuizz);

    usedIndices.clear(); // Réinitialiser les indices utilisés
    displayMixedQuizz(); // Afficher la première question mixte
  } catch (error) {
    console.log("Erreur lors du chargement des données mixtes :", error);
  }
}

// Fonction pour afficher le quizz mixte (hiragana ou katakana aléatoire)
function displayMixedQuizz() {
  if (proposal && currentQuizz < 20) {
    resetProposalStyle();

    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * mixedQuizz.length);
    } while (usedIndices.has(randomIndex)); // Assurer qu'on n'utilise pas le même indice

    usedIndices.add(randomIndex); // Ajouter à l'ensemble des indices utilisés

    const quizItem = mixedQuizz[randomIndex]; // Prendre l'élément à l'indice aléatoire

    correctAnswer = quizItem.romanji;
    proposal.textContent = quizItem.kana; // Afficher le caractère
    currentQuizz++; // Incrémenter après l'affichage de la question
  } else {
    finQuizz(); // Fin du quiz après 20 questions
  }
}

// Fonction pour mélanger un tableau (utile pour mélanger hiragana et katakana)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Échanger les éléments
  }
  return array;
}
