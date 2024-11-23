class LeagueManager {
    constructor() {
        this.leaguesContainer = document.getElementById('leagues-container');
        this.refreshButton = document.getElementById('refresh-btn');
        this.datePicker = document.getElementById('date-picker');
        
        // Проверяем существование элементов перед установкой значений
        if (this.datePicker) {
            // Set default date to today
            const today = new Date().toISOString().split('T')[0];
            this.datePicker.value = today;
        }
        
        this.teamIcons = {
            'athletic club': 'Athletic Bilbao.png',
            'atletico madrid': 'Atletico Madrid.png',
            'celta vigo': 'Celta Vigo.png',
            'deportivo la coruna': 'Deportivo La Coruna.png',
            'barcelona': 'FC Barcelona.png',
            'getafe': 'Getafe.png',
            'granada': 'Granada.png',
            'levante': 'Levante.png',
            'malaga': 'Malaga.png',
            'osasuna': 'Osasuna.png',
            'rayo vallecano': 'Rayo Vallecano.png',
            'real betis': 'Real Betis.png',
            'real madrid': 'Real Madrid.png'
        };
        
        // Устанавливаем обработчики событий только если элементы существуют
        if (this.refreshButton && this.datePicker) {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        if (this.refreshButton) {
            this.refreshButton.addEventListener('click', () => this.refreshResults());
        }
        if (this.datePicker) {
            this.datePicker.addEventListener('change', () => this.refreshResults());
        }
    }

    async fetchLeagueData() {
        try {
            const selectedDate = this.datePicker.value;
            const response = await fetch(`http://localhost:5000/api/matches?date=${selectedDate}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return [];
        }
    }

    getTeamIcon(teamName) {
        const normalizedName = teamName.toLowerCase();
        
        // Прямой поиск
        const iconFileName = this.teamIcons[normalizedName];
        if (iconFileName) {
            return `icons/${iconFileName}`;
        }
        
        // Поиск частичного совпадения
        for (const [key, value] of Object.entries(this.teamIcons)) {
            if (normalizedName.includes(key) || key.includes(normalizedName)) {
                return `icons/${value}`;
            }
        }
        
        return ''; // Возвращаем пустую строку вместо пути к default.png
    }

    createLeagueBlock(leagueData) {
        const leagueBlock = document.createElement('div');
        leagueBlock.className = 'league-block';

        const leagueName = document.createElement('h2');
        leagueName.className = 'league-name';
        leagueName.textContent = leagueData.leagueName;
        leagueBlock.appendChild(leagueName);

        leagueData.matches.forEach(match => {
            const matchDiv = document.createElement('div');
            matchDiv.className = 'match';

            // Добавляем иконку только если путь к ней существует
            const homeTeamIconPath = this.getTeamIcon(match.homeTeam);
            const awayTeamIconPath = this.getTeamIcon(match.awayTeam);

            const homeTeamIcon = homeTeamIconPath ? 
                `<img src="${homeTeamIconPath}" alt="${match.homeTeam}" class="team-icon">` : '';
            const awayTeamIcon = awayTeamIconPath ? 
                `<img src="${awayTeamIconPath}" alt="${match.awayTeam}" class="team-icon">` : '';

            matchDiv.innerHTML = `
                <div class="match-teams">
                    ${homeTeamIcon} ${match.homeTeam} vs ${awayTeamIcon} ${match.awayTeam}
                </div>
                <div class="match-score" data-full-score="${match.score.score}">
                    ${match.score.display === 'Finished' ? 
                        '<span class="clickable-score">Finished</span>' : 
                        match.score.display}
                </div>
            `;

            // Добавляем обработчик клика для счета
            const scoreElement = matchDiv.querySelector('.clickable-score');
            if (scoreElement) {
                let showingScore = false;
                scoreElement.addEventListener('click', function() {
                    const fullScore = this.closest('.match-score').dataset.fullScore;
                    if (showingScore) {
                        this.textContent = 'Finished';
                    } else {
                        this.textContent = fullScore;
                    }
                    showingScore = !showingScore;
                });
            }

            leagueBlock.appendChild(matchDiv);
        });

        return leagueBlock;
    }

    async refreshResults() {
        try {
            this.leaguesContainer.innerHTML = 'Loading...'; // Show loading state
            const leagues = await this.fetchLeagueData();
            
            if (leagues.length === 0) {
                this.leaguesContainer.innerHTML = 'No matches found for selected date';
                return;
            }

            this.leaguesContainer.innerHTML = ''; // Clear loading message
            leagues.forEach(league => {
                const leagueBlock = this.createLeagueBlock(league);
                this.leaguesContainer.appendChild(leagueBlock);
            });
        } catch (error) {
            console.error('Error refreshing results:', error);
            this.leaguesContainer.innerHTML = 'Error loading matches. Please try again.';
        }
    }
}

export { LeagueManager };

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const manager = new LeagueManager();
    manager.refreshResults(); // Load initial data
});
