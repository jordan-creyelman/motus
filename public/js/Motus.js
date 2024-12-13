export class Motus {
    constructor() {
        this.taille = 5;
        this.motsParTaille = {
            5: ["amour", "plage", "table", "nager", "ombre", "fleur", "chien", "terre", "veste", "livre"],
            6: ["banane", "tomate", "orange", "pigeon", "avocat", "citron", "chocol", "camion", "pommes", "parfum"],
            7: ["giraffe", "panther", "papyrus", "chateau", "journee", "coquill", "lacoste", "couleur", "musique", "reparer"],
        };
        this.mot = "";
        this.motCacher = [];
        this.tentatives = 5;
        this.score = 0;

        // Créer l'interface utilisateur
        this.gameContainer = document.createElement('div');
        this.gameContainer.id = 'motus-game';
        document.body.appendChild(this.gameContainer);

        this.setupForm();
        this.setupGameArea();
    }

    setupForm() {
        // Formulaire de configuration du jeu
        this.form = document.createElement('div');
        this.form.id = 'game-setup';
        
        const tailleLabel = document.createElement('label');
        tailleLabel.textContent = "Taille du mot : ";
        this.form.appendChild(tailleLabel);

        this.tailleInput = document.createElement('select');
        [5, 6, 7].forEach((taille) => {
            const option = document.createElement('option');
            option.value = taille;
            option.textContent = taille;
            this.tailleInput.appendChild(option);
        });
        this.form.appendChild(this.tailleInput);

        const tentativesLabel = document.createElement('label');
        tentativesLabel.textContent = "Nombre de tentatives : ";
        this.form.appendChild(tentativesLabel);

        this.tentativesInput = document.createElement('input');
        this.tentativesInput.type = 'number';
        this.tentativesInput.value = 5;
        this.tentativesInput.min = 1;
        this.form.appendChild(this.tentativesInput);

        this.startButton = document.createElement('button');
        this.startButton.textContent = 'Lancer le jeu';
        this.startButton.addEventListener('click', () => this.initGame());
        this.form.appendChild(this.startButton);

        this.gameContainer.appendChild(this.form);
    }

    setupGameArea() {
        // Zone de sortie (mot caché + messages)
        this.output = document.createElement('div');
        this.output.id = 'output';
        this.gameContainer.appendChild(this.output);
    
        // Champ de saisie pour entrer le mot
        this.input = document.createElement('input');
        this.input.id = 'input';
        this.input.type = 'text';
        this.input.maxLength = this.taille;
        this.input.style.display = 'none'; // Masquer initialement
        this.gameContainer.appendChild(this.input);
    
        // Bouton de soumission
        this.button = document.createElement('button');
        this.button.textContent = 'Soumettre';
        this.button.style.display = 'none'; // Masquer initialement
        this.button.addEventListener('click', () => this.handleInput());
        this.gameContainer.appendChild(this.button);
    }
    

    initGame() {
        this.taille = parseInt(this.tailleInput.value) || 5;
        this.tentatives = parseInt(this.tentativesInput.value) || 5;
    
        // Vérification si la taille est valide
        if (!this.motsParTaille[this.taille]) {
            alert("Taille invalide. Taille réinitialisée à 5.");
            this.taille = 5;
        }
    
        this.input.maxLength = this.taille;
        this.lettres = this.motsParTaille[this.taille];
    
        // Sélection aléatoire du mot
        this.mot = this.indexAleatoire();
        this.motCacher = Array(this.taille).fill('[ ]');
    
        // Effacer le formulaire
        this.form.style.display = 'none';
    
        // Afficher les éléments de jeu
        this.input.style.display = 'block';
        this.button.style.display = 'block';
    
        // Afficher le mot caché et les tentatives
        this.output.innerHTML = '';
        this.afficherMotCacher();
        this.afficher(`<p>Tentatives restantes : ${this.tentatives}</p>`);
    }
    
    

    indexAleatoire() {
        const index = Math.floor(Math.random() * this.lettres.length);
        return this.lettres[index];
    }

    afficher(message) {
        this.output.innerHTML += `<p>${message}</p>`;
    }

    afficherMotCacher() {
        const motCacherHtml = this.motCacher
            .map((lettre) => {
                if (lettre.startsWith("[") && lettre.endsWith("]")) {
                    const char = lettre.replace("[", "").replace("]", "");
                    return `<span class="correct">${char}</span>`;
                }
                return `<span>${lettre}</span>`;
            })
            .join(" ");

        if (this.output.firstChild) {
            this.output.firstChild.innerHTML = motCacherHtml;
        } else {
            const motCacherElement = document.createElement("p");
            motCacherElement.innerHTML = motCacherHtml;
            this.output.prepend(motCacherElement);
        }
    }

    verifierMot(motDonner) {
        if (motDonner.length !== this.taille) {
            this.afficher(`Le mot doit avoir ${this.taille} lettres.`);
            return false;
        }

        let motAffichage = Array(this.taille).fill('<span>[ ]</span>');
        let bienPlace = 0;
        let malPlace = [];

        const lettresRestantes = [...this.mot];

        for (let i = 0; i < this.taille; i++) {
            if (motDonner[i] === this.mot[i]) {
                motAffichage[i] = `[${motDonner[i].toUpperCase()}]`;
                bienPlace++;
                lettresRestantes[i] = null;
            }
        }

        for (let i = 0; i < this.taille; i++) {
            if (motDonner[i] !== this.mot[i] && lettresRestantes.includes(motDonner[i])) {
                motAffichage[i] = `<span class="misplaced">${motDonner[i].toUpperCase()}</span>`;
                lettresRestantes[lettresRestantes.indexOf(motDonner[i])] = null;
            }
        }

        this.motCacher = motAffichage;
        this.afficherMotCacher();
        this.afficher(`Lettres mal placées : ${malPlace.join(", ")}`);

        return bienPlace === this.taille;
    }

    handleInput() {
        const motDonner = this.input.value.trim().toLowerCase();
        this.input.value = '';

        if (!motDonner) {
            this.afficher("Merci de jouer !");
            return;
        }

        const trouver = this.verifierMot(motDonner);

        if (trouver) {
            this.afficher("Félicitations, vous avez trouvé le mot !");
            this.score++;
            if (confirm("Voulez-vous rejouer ?")) {
                this.reinitialiser();
            }
        } else {
            this.tentatives--;
            if (this.tentatives > 0) {
                this.afficher(`Tentatives restantes : ${this.tentatives}`);
            } else {
                this.afficher(`Dommage, vous avez perdu. Le mot était : ${this.mot.toUpperCase()}`);
                if (confirm("Voulez-vous rejouer ?")) {
                    this.reinitialiser();
                }
            }
        }
    }

    reinitialiser() {
        this.form.style.display = 'block'; // Réaffiche le formulaire
        this.input.style.display = 'none'; // Cache le champ de saisie
        this.button.style.display = 'none'; // Cache le bouton de soumission
        this.output.innerHTML = ''; // Réinitialise la zone de sortie
        this.afficher(`Score actuel : ${this.score}`);
    }
    

    jouer() {
        this.afficherMotCacher();
    }
}
