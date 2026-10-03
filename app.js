document.addEventListener('DOMContentLoaded', () => {
    
    lucide.createIcons();

    // 1. Core Data
    const categoriesData = [
        { id: 'ideas', name: 'Ideas', icon: 'lightbulb', class: 'ideas' },
        { id: 'work', name: 'Work', icon: 'briefcase', class: 'work' },
        { id: 'personal', name: 'Personal', icon: 'user', class: 'personal' },
        { id: 'shopping', name: 'Shopping', icon: 'shopping-cart', class: 'shopping' },
        { id: 'important', name: 'Important', icon: 'star', class: 'important' },
        { id: 'random', name: 'Random', icon: 'more-horizontal', class: 'random' }
    ];

    const defaultNotes = [
        { id: 1, title: 'Content ideas for MuscleBlaze', content: 'Protein myths (reddit style)\nBeginner workout guide\nBest whey under 2k', category: 'ideas', time: new Date().getTime() - 7200000 },
        { id: 2, title: 'Workout routine', content: 'Push - Chest, Shoulders, Triceps\nPull - Back, Biceps\nLegs - Quads, Hamstrings', category: 'personal', time: new Date().getTime() - 86400000 },
        { id: 3, title: 'Grocery list', content: 'Eggs, Milk, Oats, Coffee, Chicken breast', category: 'shopping', time: new Date().getTime() - 18000000 }
    ];

    // 2. Storage Setup
    let notes = defaultNotes;
    try {
        const saved = localStorage.getItem('noter_data_v1');
        if (saved) notes = JSON.parse(saved);
    } catch (e) {
        console.warn("Storage access denied.");
    }

    function saveNotes() {
        try {
            localStorage.setItem('noter_data_v1', JSON.stringify(notes));
        } catch (e) {
            console.warn("Cannot save notes.");
        }
    }

    // 3. Routing Engine
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-target');
            
            // Switch Screens
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById(target).classList.add('active');
            
            // Update Active Tab State
            if(link.classList.contains('nav-item')) {
                document.querySelectorAll('.bottom-nav .nav-item').forEach(nav => nav.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });

    // 4. Render Engine
    function renderApp() {
        // Render Home Grid
        const homeGrid = document.getElementById('home-categories-grid');
        homeGrid.innerHTML = '';
        
        // Render Full Categories List
        const catList = document.getElementById('categories-list-full');
        catList.innerHTML = '';

        categoriesData.forEach(cat => {
            const count = notes.filter(n => n.category === cat.id).length;
            
            // Inject Grid Card
            homeGrid.innerHTML += `
                <div class="category-card nav-link" data-target="screen-search" style="cursor:pointer;">
                    <div class="cat-icon ${cat.class}"><i data-lucide="${cat.icon}"></i></div>
                    <div class="cat-info">
                        <h3>${cat.name}</h3>
                        <p>${count}</p>
                    </div>
                </div>
            `;

            // Inject List Item
            catList.innerHTML += `
                <div class="category-list-item nav-link" data-target="screen-search" style="cursor:pointer;">
                    <div class="category-list-left">
                        <div class="cat-icon-small ${cat.class}"><i data-lucide="${cat.icon}"></i></div>
                        <h3>${cat.name}</h3>
                    </div>
                    <div class="category-list-right">
                        <span>${count}</span>
                        <i data-lucide="chevron-right"></i>
                    </div>
                </div>
            `;
        });

        // Re-attach routing to newly generated category cards
        document.querySelectorAll('.category-card, .category-list-item').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
                document.getElementById('screen-search').classList.add('active');
                document.querySelectorAll('.bottom-nav .nav-item').forEach(nav => nav.classList.remove('active'));
                document.querySelectorAll('.bottom-nav .nav-item')[1].classList.add('active'); // Set Search active
            });
        });

        // Render Recent Notes
        const notesContainer = document.getElementById('recent-notes-list');
        notesContainer.innerHTML = '';
        const sortedNotes = [...notes].sort((a, b) => b.time - a.time).slice(0, 5); 
        
        sortedNotes.forEach(note => {
            const cat = categoriesData.find(c => c.id === note.category) || categoriesData[0];
            const timeDiff = Math.floor((new Date().getTime() - note.time) / 3600000);
            const timeStr = timeDiff === 0 ? 'Just now' : (timeDiff < 24 ? `${timeDiff}h ago` : `${Math.floor(timeDiff/24)}d ago`);
            
            notesContainer.innerHTML += `
                <div class="note-item">
                    <div class="cat-icon-small ${cat.class}"><i data-lucide="${cat.icon}"></i></div>
                    <div class="note-content">
                        <h4>${note.title}</h4>
                        <p>${note.content.replace(/\n/g, ' - ')}</p>
                    </div>
                    <span class="time">${timeStr}</span>
                </div>
            `;
        });
        
        lucide.createIcons();
    }

    // 5. Create Note Engine
    let selectedCategory = 'ideas'; 
    const selector = document.getElementById('category-selector');
    
    function setupForm() {
        selector.innerHTML = '';
        categoriesData.forEach(cat => {
            selector.innerHTML += `
                <div class="cat-select-btn ${cat.id === selectedCategory ? 'selected' : ''}" data-id="${cat.id}">
                    <div class="cat-icon-small ${cat.class}"><i data-lucide="${cat.icon}"></i></div>
                    <span>${cat.name}</span>
                </div>
            `;
        });

        document.querySelectorAll('.cat-select-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.cat-select-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedCategory = btn.getAttribute('data-id');
            });
        });
        lucide.createIcons();
    }

    document.getElementById('save-note-btn').addEventListener('click', () => {
        const title = document.getElementById('note-title').value;
        const content = document.getElementById('note-content').value;
        
        if(!title) return alert("Please add a title for your note.");

        notes.unshift({
            id: Date.now(),
            title,
            content,
            category: selectedCategory,
            time: new Date().getTime()
        });
        
        saveNotes();
        
        // Reset form
        document.getElementById('note-title').value = '';
        document.getElementById('note-content').value = '';
        
        // Navigate Home
        document.getElementById('screen-new').classList.remove('active');
        document.getElementById('screen-home').classList.add('active');
        document.querySelectorAll('.bottom-nav .nav-item').forEach(nav => nav.classList.remove('active'));
        document.querySelectorAll('.bottom-nav .nav-item')[0].classList.add('active'); 
        
        renderApp(); 
    });

    // 6. Search Engine
    document.getElementById('search-input').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const resultsContainer = document.getElementById('search-results-list');
        resultsContainer.innerHTML = '';
        
        if(query.trim() === '') return; 

        const filtered = notes.filter(n => n.title.toLowerCase().includes(query) || n.content.toLowerCase().includes(query));
        
        filtered.forEach(note => {
            const cat = categoriesData.find(c => c.id === note.category) || categoriesData[0];
            resultsContainer.innerHTML += `
                <div class="note-item">
                    <div class="cat-icon-small ${cat.class}"><i data-lucide="${cat.icon}"></i></div>
                    <div class="note-content">
                        <h4>${note.title}</h4>
                        <p>${note.content.replace(/\n/g, ' - ')}</p>
                    </div>
                </div>
            `;
        });
        lucide.createIcons();
    });

    // 7. Initialization
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('en-US', options);
    
    const hour = new Date().getHours();
    const greetingText = document.getElementById('greeting-text');
    
    if (hour >= 17) greetingText.innerText = 'Good evening, Zayd';
    else if (hour >= 12) greetingText.innerText = 'Good afternoon, Zayd';
    else greetingText.innerText = 'Good morning, Zayd';

    setupForm();
    renderApp();
});
