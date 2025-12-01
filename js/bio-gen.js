/**
 * Generative Bio Animation
 * Simulates an LLM generating the user's bio
 */

/**
 * Generative Board Animation
 * Simulates an LLM generating text
 */

class GenerativeBoard {
    constructor(config) {
        this.containerId = config.containerId;
        this.prompt = config.prompt;
        this.text = config.text;
        this.modelName = config.modelName || 'LucioGPT-v1.0';

        this.container = document.getElementById(this.containerId);
        if (!this.container) return;

        this.init();
    }

    async init() {
        this.container.innerHTML = '';

        // Create UI structure
        this.createInterface();

        // Start animation sequence
        await this.typePrompt();
        await this.showThinking();
        await this.streamText();
    }

    createInterface() {
        this.container.innerHTML = `
            <div class="font-mono text-sm h-full flex flex-col">
                <!-- Header -->
                <div class="flex items-center justify-between border-b border-slate-700/50 pb-4 mb-6">
                    <div class="flex items-center gap-3">
                        <div class="relative">
                            <div class="absolute inset-0 bg-ai-accent/20 blur-md rounded-full"></div>
                            <div class="relative w-8 h-8 rounded-full bg-gradient-to-br from-ai-accent to-purple-500 flex items-center justify-center">
                                <i class="ph ph-sparkle text-white text-sm"></i>
                            </div>
                        </div>
                        <div>
                            <div class="text-white font-bold text-base">${this.modelName}</div>
                            <div class="text-slate-500 text-xs flex items-center gap-2 mt-0.5">
                                <span class="flex items-center gap-1">
                                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span>Running</span>
                                </span>
                                <span>•</span>
                                <span>Fine-tuned: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <div class="w-3 h-3 rounded-full bg-slate-700 hover:bg-slate-600 transition cursor-pointer"></div>
                        <div class="w-3 h-3 rounded-full bg-slate-700 hover:bg-slate-600 transition cursor-pointer"></div>
                        <div class="w-3 h-3 rounded-full bg-slate-700 hover:bg-slate-600 transition cursor-pointer"></div>
                    </div>
                </div>

                <!-- Chat Area -->
                <div class="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                    <!-- User Prompt -->
                    <div class="flex gap-4 opacity-0 transition-opacity duration-500" id="${this.containerId}-prompt-container">
                        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shrink-0 border border-slate-600">
                            <i class="ph ph-user text-slate-300 text-sm"></i>
                        </div>
                        <div class="flex-1 pt-1">
                            <div class="text-slate-400 text-xs mb-1 font-semibold">You</div>
                            <p class="text-slate-200 leading-relaxed" id="${this.containerId}-prompt-text"></p>
                        </div>
                    </div>

                    <!-- AI Response -->
                    <div class="flex gap-4 opacity-0 transition-opacity duration-500" id="${this.containerId}-response-container">
                        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-ai-accent/20 to-purple-500/20 border border-ai-accent/30 flex items-center justify-center shrink-0">
                            <i class="ph ph-sparkle text-ai-accent text-sm"></i>
                        </div>
                        <div class="flex-1 pt-1">
                            <div class="text-ai-accent text-xs mb-1 font-semibold">${this.modelName}</div>
                            <div id="${this.containerId}-thinking" class="hidden flex items-center gap-2 text-slate-500 text-xs mb-3 bg-slate-800/50 rounded-lg px-3 py-2 w-fit">
                                <div class="flex gap-1">
                                    <span class="w-1.5 h-1.5 rounded-full bg-ai-accent animate-bounce"></span>
                                    <span class="w-1.5 h-1.5 rounded-full bg-ai-accent animate-bounce" style="animation-delay: 0.1s"></span>
                                    <span class="w-1.5 h-1.5 rounded-full bg-ai-accent animate-bounce" style="animation-delay: 0.2s"></span>
                                </div>
                                <span class="text-slate-400">Generating response...</span>
                            </div>
                            <div class="text-slate-200 leading-relaxed whitespace-pre-wrap" id="${this.containerId}-text"></div>
                            <span class="inline-block w-0.5 h-5 bg-ai-accent animate-pulse ml-0.5 align-middle" id="${this.containerId}-cursor"></span>
                        </div>
                    </div>
                </div>

                <!-- Footer Stats -->
                <div class="border-t border-slate-700/50 pt-4 mt-4 flex items-center justify-between text-xs text-slate-500">
                    <div class="flex items-center gap-4">
                        <span class="flex items-center gap-1.5">
                            <i class="ph ph-clock text-slate-600"></i>
                            <span id="${this.containerId}-timer">0.0s</span>
                        </span>
                        <span class="flex items-center gap-1.5">
                            <i class="ph ph-cpu text-slate-600"></i>
                            <span id="${this.containerId}-tokens">0 tokens</span>
                        </span>
                    </div>
                    <div class="text-slate-600">Built with attention (mechanisms)</div>
                </div>
            </div>
        `;
    }

    async typePrompt() {
        const container = document.getElementById(`${this.containerId}-prompt-container`);
        const textEl = document.getElementById(`${this.containerId}-prompt-text`);

        container.classList.remove('opacity-0');

        for (let i = 0; i < this.prompt.length; i++) {
            textEl.textContent += this.prompt[i];
            await this.wait(30 + Math.random() * 30);
        }

        await this.wait(500);
    }

    async showThinking() {
        const container = document.getElementById(`${this.containerId}-response-container`);
        const thinking = document.getElementById(`${this.containerId}-thinking`);

        container.classList.remove('opacity-0');
        thinking.classList.remove('hidden');

        await this.wait(1500);

        thinking.classList.add('hidden');
    }

    async streamText() {
        const textEl = document.getElementById(`${this.containerId}-text`);
        const cursor = document.getElementById(`${this.containerId}-cursor`);
        const timerEl = document.getElementById(`${this.containerId}-timer`);
        const tokensEl = document.getElementById(`${this.containerId}-tokens`);

        const startTime = Date.now();
        let tokenCount = 0;

        // Update timer
        const timerInterval = setInterval(() => {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            if (timerEl) timerEl.textContent = `${elapsed}s`;
        }, 100);

        // Split by words for a more realistic "token" streaming effect
        // but preserve newlines
        const tokens = this.text.split(/(\s+)/);

        for (let token of tokens) {
            textEl.textContent += token;
            tokenCount++;

            // Update token counter
            if (tokensEl) tokensEl.textContent = `${tokenCount} tokens`;

            // Scroll to bottom if needed
            // this.container.scrollTop = this.container.scrollHeight;

            // Random delay to simulate token generation time
            await this.wait(20 + Math.random() * 30);
        }

        clearInterval(timerInterval);

        // Final update
        const finalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        if (timerEl) timerEl.textContent = `${finalTime}s`;

        // Keep cursor blinking for a while then hide
        await this.wait(2000);
        cursor.style.display = 'none';
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
