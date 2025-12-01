// Main JavaScript file

// Helper to format dates
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Helper to parse markdown links [text](url)
function parseMarkdown(text) {
    if (!text) return '';
    return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-ai-accent hover:underline" target="_blank">$1</a>');
}

// Helper to determine news category and icon
function getNewsCategory(item) {
    // Manual override
    if (item.category) {
        const cat = item.category.toLowerCase();
        if (cat === 'publication') return { icon: 'ph-scroll', label: 'Publication', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' };
        if (cat === 'talk') return { icon: 'ph-microphone-stage', label: 'Talk', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' };
        if (cat === 'award') return { icon: 'ph-trophy', label: 'Award', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' };
        if (cat === 'project') return { icon: 'ph-rocket-launch', label: 'Project', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' };
        if (cat === 'travel') return { icon: 'ph-airplane-tilt', label: 'Travel', color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/20' };
        if (cat === 'update') return { icon: 'ph-star', label: 'Update', color: 'text-ai-accent', bg: 'bg-ai-accent/10', border: 'border-ai-accent/20' };
    }

    // Automatic detection
    const text = item.content || '';
    const lower = text.toLowerCase();
    if (lower.includes('accept') || lower.includes('publish') || lower.includes('paper')) return { icon: 'ph-scroll', label: 'Publication', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' };
    if (lower.includes('talk') || lower.includes('present') || lower.includes('conference') || lower.includes('keynote')) return { icon: 'ph-microphone-stage', label: 'Talk', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' };
    if (lower.includes('award') || lower.includes('honor') || lower.includes('grant') || lower.includes('prize')) return { icon: 'ph-trophy', label: 'Award', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' };
    if (lower.includes('release') || lower.includes('launch') || lower.includes('code')) return { icon: 'ph-rocket-launch', label: 'Project', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' };
    if (lower.includes('visit') || lower.includes('travel')) return { icon: 'ph-airplane-tilt', label: 'Travel', color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/20' };
    return { icon: 'ph-star', label: 'Update', color: 'text-ai-accent', bg: 'bg-ai-accent/10', border: 'border-ai-accent/20' };
}

// Load News
function loadNews(limit = false) {
    const container = document.getElementById('news-container');
    if (!container) return;

    let news = window.siteData.news || [];

    // Sort by date descending
    news.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (limit) {
        news = news.slice(0, limit);
    }

    container.innerHTML = news.map((item, index) => {
        const cat = getNewsCategory(item);
        const isNew = index === 0 && limit; // Only show NEW badge on first item in limited view

        return `
        <div class="group relative pl-8 pb-8 border-l border-slate-800 last:pb-0 last:border-0">
            <!-- Timeline Dot -->
            <div class="absolute -left-[17px] top-0 flex items-center justify-center">
                <div class="w-9 h-9 rounded-full bg-slate-900 border border-slate-700 group-hover:border-ai-accent group-hover:scale-110 transition duration-300 flex items-center justify-center z-10">
                    <i class="ph ${cat.icon} ${cat.color} text-lg"></i>
                </div>
            </div>
            
            <!-- Card -->
            <div class="glass p-5 rounded-xl border border-slate-700/50 hover:border-ai-accent/30 hover:bg-slate-800/50 transition duration-300 relative overflow-hidden group-hover:shadow-lg group-hover:shadow-ai-accent/5">
                ${isNew ? `
                <div class="absolute top-0 right-0">
                    <div class="bg-ai-accent text-ai-dark text-[10px] font-bold px-2 py-1 rounded-bl-lg shadow-lg animate-pulse">
                        NEW
                    </div>
                </div>` : ''}
                
                <div class="flex flex-col gap-3">
                    <div class="flex items-center gap-3">
                        <span class="font-mono text-xs text-slate-400 bg-slate-900/50 px-2 py-1 rounded border border-slate-700/50">
                            ${formatDate(item.date)}
                        </span>
                        <span class="text-[10px] font-bold uppercase tracking-wider ${cat.color} ${cat.bg} px-2 py-1 rounded border ${cat.border}">
                            ${cat.label}
                        </span>
                    </div>
                    
                    <div class="text-slate-200 group-hover:text-white transition leading-relaxed text-sm sm:text-base">
                        ${parseMarkdown(item.content)}
                    </div>
                </div>
            </div>
        </div>
    `}).join('');
}

// Load Projects
function loadProjects() {
    const container = document.getElementById('projects-container');
    if (!container) return;

    const projects = window.siteData.projects || [];

    container.innerHTML = projects.map(project => {
        // Extract YouTube link from body if exists
        const youtubeMatch = project.body && project.body.match(/\[here\]\((https:\/\/youtu\.be\/[^\)]+)\)/);
        const youtubeLink = youtubeMatch ? youtubeMatch[1] : null;

        return `
        <div class="glass rounded-2xl border border-slate-700/50 hover:border-ai-accent/50 transition group relative overflow-hidden">
            ${project.image ? `
            <div class="relative h-48 overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-t from-ai-dark via-transparent to-transparent z-10"></div>
                <img src="${project.image}" alt="${project.title}" 
                    class="w-full h-full object-cover transform group-hover:scale-110 transition duration-500">
            </div>` : ''}
            
            <div class="p-8 relative z-10">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-2xl font-bold text-white group-hover:text-ai-accent transition">${project.title}</h3>
                    <div class="flex gap-3">
                        ${project.github ? `
                        <a href="${project.github}" target="_blank" 
                            class="text-slate-400 hover:text-white transition" title="View on GitHub">
                            <i class="ph ph-github-logo text-2xl"></i>
                        </a>` : ''}
                        ${youtubeLink ? `
                        <a href="${youtubeLink}" target="_blank" 
                            class="text-slate-400 hover:text-red-500 transition" title="Watch Demo">
                            <i class="ph ph-youtube-logo text-2xl"></i>
                        </a>` : ''}
                    </div>
                </div>
                
                <p class="text-slate-400 leading-relaxed">
                    ${project.description || 'No description available.'}
                </p>
            </div>
        </div>
    `}).join('');
}

// Load Teaching
function loadTeaching() {
    const container = document.getElementById('teaching-container');
    if (!container) return;

    const teaching = window.siteData.teaching || [];

    // Sort by year descending
    teaching.sort((a, b) => (b.year || 0) - (a.year || 0));

    // Group by academic year
    const grouped = {};
    teaching.forEach(item => {
        const year = item.academicYear || item.year;
        if (!grouped[year]) {
            grouped[year] = [];
        }
        grouped[year].push(item);
    });

    // Helper to get level badge
    const getLevelBadge = (level) => {
        const badges = {
            'PhD': { icon: 'ph-graduation-cap', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', label: 'PhD' },
            "Master's": { icon: 'ph-student', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', label: "Master's" },
            "Bachelor's": { icon: 'ph-book-open', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20', label: "Bachelor's" }
        };
        return badges[level] || badges["Master's"];
    };

    // Helper to get role badge
    const getRoleBadge = (category) => {
        if (category === 'Teaching') {
            return { label: 'T', color: 'text-ai-accent', bg: 'bg-ai-accent/10', border: 'border-ai-accent/20' };
        } else {
            return { label: 'TA', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20' };
        }
    };

    let html = `
        <div class="mb-8">
            <p class="text-slate-400 text-lg leading-relaxed">
                I serve as a teacher <span class="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-ai-accent bg-ai-accent/10 px-2 py-1 rounded border border-ai-accent/20">T</span> 
                or teaching assistant <span class="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-400/10 px-2 py-1 rounded border border-slate-400/20">TA</span> 
                for the following courses:
            </p>
        </div>
    `;

    Object.entries(grouped).forEach(([academicYear, items], yearIndex) => {
        html += `
            <div class="${yearIndex > 0 ? 'mt-12' : ''}">
                <div class="flex items-center gap-4 mb-6">
                    <h2 class="text-2xl font-bold text-white">Academic Year ${academicYear}</h2>
                    <div class="h-px flex-1 bg-slate-800"></div>
                </div>
                <div class="grid gap-4">
                    ${items.map((item, index) => {
            const levelBadge = getLevelBadge(item.level);
            const roleBadge = getRoleBadge(item.category);
            const departmentInfo = item.department ? `@${item.department}, ` : '';

            return `
                        <div class="group glass p-5 rounded-xl border border-slate-700/50 hover:border-ai-accent/30 transition-all duration-300">
                            <div class="flex items-start gap-4">
                                <div class="flex items-center gap-2 shrink-0">
                                    <span class="text-sm font-bold uppercase tracking-wider ${roleBadge.color} ${roleBadge.bg} px-3 py-1.5 rounded-md border ${roleBadge.border}">
                                        ${roleBadge.label}
                                    </span>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex flex-wrap items-center gap-2 mb-2">
                                        <h3 class="text-lg font-semibold text-white group-hover:text-ai-accent transition">
                                            ${item.title}
                                        </h3>
                                        <span class="text-xs font-bold uppercase tracking-wider ${levelBadge.color} ${levelBadge.bg} px-2 py-1 rounded border ${levelBadge.border} flex items-center gap-1">
                                            <i class="ph ${levelBadge.icon} text-xs"></i>
                                            ${levelBadge.label}
                                        </span>
                                    </div>
                                    <p class="text-slate-400 text-sm leading-relaxed">
                                        ${item.degree} ${departmentInfo}${item.institution}
                                    </p>
                                </div>
                            </div>
                        </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    });

    container.innerHTML = html || '<p class="text-slate-400 text-center py-12">No teaching activities found.</p>';
}

// Simple BibTeX Parser
function parseBibTeX(bibtex) {
    const entries = [];
    // Split by @article, @inproceedings, etc.
    const rawEntries = bibtex.split(/@(\w+)\s*{/g).slice(1);

    for (let i = 0; i < rawEntries.length; i += 2) {
        const type = rawEntries[i];
        const content = rawEntries[i + 1];
        if (!content) continue;

        const entry = { type };
        // Extract key (first string before comma)
        const keyMatch = content.match(/^([^,]+),/);
        if (keyMatch) entry.key = keyMatch[1].trim();

        // Extract fields
        const fieldRegex = /(\w+)\s*=\s*{([^}]+)}/g;
        let match;
        while ((match = fieldRegex.exec(content)) !== null) {
            entry[match[1].toLowerCase()] = match[2];
        }
        entries.push(entry);
    }
    return entries;
}

// Load Publications
function loadPublications(limit = false, filters = {}) {
    const container = document.getElementById('publications-container');
    if (!container) return;

    let papers = window.siteData.papers || [];

    // Filter by search query
    if (filters.search) {
        const query = filters.search.toLowerCase();
        papers = papers.filter(p =>
            (p.title && p.title.toLowerCase().includes(query)) ||
            (p.author && p.author.toLowerCase().includes(query)) ||
            (p.journal && p.journal.toLowerCase().includes(query)) ||
            (p.booktitle && p.booktitle.toLowerCase().includes(query))
        );
    }

    // Filter by year
    if (filters.year && filters.year !== 'all') {
        papers = papers.filter(p => p.year == filters.year);
    }

    // Sort by year descending
    papers.sort((a, b) => (b.year || 0) - (a.year || 0));

    if (limit) {
        papers = papers.slice(0, limit);
    }

    // Group by year if not limited (i.e., on full page)
    let html = '';
    let currentYear = null;

    papers.forEach((paper, index) => {
        // Add year header if needed
        if (!limit && paper.year !== currentYear) {
            currentYear = paper.year;
            html += `
                <div class="flex items-center gap-4 py-6 mt-4 first:mt-0">
                    <h2 class="text-2xl font-bold text-white">${currentYear}</h2>
                    <div class="h-px flex-1 bg-slate-800"></div>
                </div>
            `;
        }

        // Generate BibTeX
        const rawBibTex = `@article{${paper.id || 'paper' + index},
  title={${paper.title}},
  author={${paper.author}},
  journal={${paper.journal || paper.booktitle || 'Preprint'}},
  year={${paper.year}}
}`;

        html += `
        <div class="glass p-6 rounded-xl border border-slate-700/50 hover:border-ai-accent/50 transition group mb-6">
            <div class="flex flex-col md:flex-row gap-6">
                ${paper.preview ? `
                <div class="w-full md:w-32 shrink-0 overflow-hidden rounded-lg border border-slate-700/50 self-start">
                    <img src="assets/img/publication_preview/${paper.preview}" alt="${paper.title}" 
                        class="w-full h-full object-cover transform group-hover:scale-110 transition duration-500">
                </div>` : ''}
                <div class="flex-1">
                    <h3 class="text-xl font-bold text-white mb-2 group-hover:text-ai-accent transition">
                        ${paper.title || 'Untitled'}
                    </h3>
                    <p class="text-slate-400 mb-3 text-sm">
                        ${(paper.author || 'Unknown Authors').replace(/La Cava, Lucio/g, '<strong>La Cava, Lucio</strong>').replace(/Lucio La Cava/g, '<strong>Lucio La Cava</strong>')}
                    </p>
                    <div class="flex flex-wrap gap-3 text-xs font-mono text-slate-500 mb-4">
                        <span class="bg-slate-800 px-2 py-1 rounded">${paper.year || 'n.d.'}</span>
                        <span class="bg-slate-800 px-2 py-1 rounded">${paper.journal || paper.booktitle || 'Preprint'}</span>
                    </div>
                    
                    <div class="flex gap-3">
                        ${paper.doi ? `
                        <a href="https://doi.org/${paper.doi}" target="_blank" class="flex items-center gap-2 text-xs font-bold text-white bg-ai-accent/20 px-3 py-2 rounded hover:bg-ai-accent hover:text-ai-dark transition">
                            <i class="ph ph-link"></i> DOI
                        </a>` : ''}
                        ${paper.arxiv ? `
                        <a href="${paper.arxiv}" target="_blank" class="flex items-center gap-2 text-xs font-bold text-white bg-ai-accent/20 px-3 py-2 rounded hover:bg-ai-accent hover:text-ai-dark transition">
                            <i class="ph ph-file-text"></i> arXiv
                        </a>` : ''}
                        ${paper.pdf ? `
                        <a href="${paper.pdf}" target="_blank" class="flex items-center gap-2 text-xs font-bold text-white bg-red-500/20 px-3 py-2 rounded hover:bg-red-500 transition">
                            <i class="ph ph-file-pdf"></i> PDF
                        </a>` : ''}
                        <button onclick="toggleBibtex('bib-${index}')" class="flex items-center gap-2 text-xs font-bold text-slate-400 border border-slate-700 px-3 py-2 rounded hover:text-white hover:border-slate-500 transition">
                            <i class="ph ph-quotes"></i> BibTeX
                        </button>
                    </div>
                    
                    <!-- BibTeX Popup -->
                    <div id="bib-${index}" class="hidden mt-4 p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-400 overflow-x-auto relative">
                        <pre>${rawBibTex}</pre>
                        <button onclick="copyToClipboard('${rawBibTex.replace(/\n/g, '\\n').replace(/'/g, "\\'")}')" class="absolute top-2 right-2 text-slate-500 hover:text-white">
                            <i class="ph ph-copy"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    });

    container.innerHTML = html || '<p class="text-slate-400 text-center py-12">No publications found matching your criteria.</p>';
}

// Toggle BibTeX visibility
function toggleBibtex(id) {
    const el = document.getElementById(id);
    el.classList.toggle('hidden');
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('BibTeX copied to clipboard!');
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set current year
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Setup Publications Filter
    const searchInput = document.getElementById('pub-search');
    const yearSelect = document.getElementById('pub-year-filter');

    if (searchInput && yearSelect) {
        // Populate years
        const papers = window.siteData.papers || [];
        const years = [...new Set(papers.map(p => p.year).filter(y => y))].sort((a, b) => b - a);

        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });

        // Event Listeners
        const updateFilters = () => {
            loadPublications(false, {
                search: searchInput.value,
                year: yearSelect.value
            });
        };

        searchInput.addEventListener('input', updateFilters);
        yearSelect.addEventListener('change', updateFilters);
    }
});
