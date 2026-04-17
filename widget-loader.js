/**
 * ============================================================
 * GOOGLE REVIEWS WIDGET LOADER — PREMIUM DUAL-CARD & AUTO-PLAY
 * ============================================================
 */

(function () {
    window.GRWidget = {
        init: function () {
            const container = document.getElementById('google-reviews-widget');
            if (!container) return;

            container.innerHTML = '<div style="display:flex; justify-content:center; padding: 60px;"><div class="grw-spinner"></div></div>';

            const queryRaw = container.getAttribute('data-query') || '';
            let query = '';
            try { query = atob(queryRaw); } catch (e) { query = queryRaw; }

            const color = container.getAttribute('data-color') || '#e11d48';
            
            // Detecta a URL base através do endereço do próprio script instalado
            const scriptTag = document.currentScript || Array.from(document.querySelectorAll('script')).find(s => s.src.includes('widget-loader.js'));
            const baseUrl = scriptTag ? new URL(scriptTag.src).origin : window.location.origin;

            this.injectStyles(color);

            fetch(`${baseUrl}/fetch-reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    [query.includes('ChIJ') ? 'place_id' : 'name']: query,
                    limit: 15
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (!data.success || !data.reviews || data.reviews.length === 0) {
                        container.innerHTML = '<div class="grw-error">Nenhuma avaliação encontrada.</div>';
                        return;
                    }
                    this.render(data, container, color);
                })
                .catch(() => {
                    container.innerHTML = '<div class="grw-error">Erro de conexão.</div>';
                });
        },

        injectStyles: function (color) {
            if (document.getElementById('grw-styles')) return;
            const style = document.createElement('style');
            style.id = 'grw-styles';
            style.innerHTML = `
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');
                
                #google-reviews-widget { 
                    font-family: 'Outfit', sans-serif; 
                    max-width: 1200px; 
                    margin: 0 auto; 
                    border-radius: 24px;
                    overflow: hidden;
                    background: #111827;
                    color: #fff;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    padding-top: 20px; /* Reduzido de 40px */
                }

                .grw-body { position: relative; padding: 0 60px; overflow: hidden; margin-bottom: 25px; /* Reduzido de 40px */ }
                .grw-track { display: flex; gap: 20px; transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1); width: 100%; }

                .grw-card {
                    flex: 1 0 100%;
                    background: #ffffff;
                    border-radius: 20px;
                    padding: 35px;
                    color: #1a202c;
                    position: relative;
                    box-shadow: 0 15px 30px -5px rgba(0,0,0,0.2);
                    min-height: 320px;
                    display: flex;
                    flex-direction: column;
                }
                
                @media (min-width: 768px) { .grw-card { flex: 0 0 calc(50% - 10px); } }
                @media (min-width: 1024px) { .grw-card { flex: 0 0 calc(50% - 10px); } }

                .grw-card-header { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; position: relative; }
                .grw-avatar { width: 55px; height: 55px; border-radius: 50%; object-fit: cover; }
                .grw-username { font-weight: 700; font-size: 18px; color: #111827; display: block; }
                .grw-time { font-size: 13px; color: #718096; }
                .grw-google-icon { position: absolute; top: 0; right: 0; width: 24px; }

                .grw-rating-row { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; color: #fbbf24; font-size: 22px; }
                .grw-check { width: 18px; fill: #3b82f6; }
                
                .grw-text { 
                    font-size: 17px; 
                    line-height: 1.7; 
                    color: #334155; 
                    overflow: hidden; 
                    display: -webkit-box; 
                    -webkit-line-clamp: 6;
                    -webkit-box-orient: vertical; 
                    flex: 1;
                }

                .grw-footer {
                    background: rgba(255,255,255,0.03);
                    border-top: 1px solid rgba(255,255,255,0.08);
                    padding: 20px 40px; /* Reduzido de 40px para 20px no vertical */
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                }
                @media (min-width: 768px) { .grw-footer { flex-direction: row; justify-content: space-between; text-align: left; } }

                .grw-footer-headline { font-weight: 800; font-size: 24px; color: #fff; letter-spacing: 1px; margin-bottom: 5px; }
                .grw-footer-stars { color: #fbbf24; font-size: 22px; margin-bottom: 5px; }
                .grw-footer-total { font-size: 14px; color: rgba(255,255,255,0.5); font-weight: 600; }

                .grw-cta { 
                    background: ${color}; 
                    color: #fff !important; 
                    padding: 16px 36px; 
                    border-radius: 12px; 
                    text-decoration: none !important; 
                    font-weight: 800; 
                    font-size: 16px; 
                    box-shadow: 0 4px 14px 0 rgba(225, 29, 72, 0.39);
                    transition: all 0.2s;
                    display: inline-block;
                }
                .grw-cta:hover { transform: translateY(-3px); filter: brightness(1.1); }

                .grw-nav {
                    position: absolute;
                    top: 45%;
                    transform: translateY(-50%);
                    width: 44px;
                    height: 44px;
                    background: #fff;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 10;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    border: none;
                }
                .grw-nav svg { width: 24px; fill: #111827; }
                .grw-nav:hover { background: #f3f4f6; scale: 1.1; }
                .grw-prev { left: 10px; }
                .grw-next { right: 10px; }

                .grw-spinner { width: 50px; height: 50px; border: 5px solid rgba(255,255,255,0.1); border-left-color: #fff; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .grw-error { padding: 40px; text-align: center; color: #ef4444; font-weight: 700; width: 100%; }
            `;
            document.head.appendChild(style);
        },

        render: function (data, target, color) {
            const reviews = data.reviews || [];
            const business = data.business || {};
            const writeReviewUrl = `https://search.google.com/local/writereview?placeid=${business.place_id || ''}`;

            const iconGoogle = '<svg viewBox="0 0 24 24" width="22"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>';
            const iconCheck = '<svg class="grw-check" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';

            let html = `
                <div class="grw-body" onmouseover="GRWidget.stopAutoPlay()" onmouseout="GRWidget.startAutoPlay()">
                    <button class="grw-nav grw-prev" onclick="GRWidget.move(-1)">
                        <svg width="24" height="24" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                    </button>
                    <div class="grw-track" id="grw-track">
            `;

            reviews.forEach(r => {
                const avatar = r.author_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.author_name)}&background=random&color=fff`;
                html += `
                    <div class="grw-card">
                        <div class="grw-card-header">
                            <img src="${avatar}" class="grw-avatar" referrerpolicy="no-referrer">
                            <div class="grw-user-info">
                                <span class="grw-username">${r.author_name}</span>
                                <span class="grw-time">${r.time || 'Recente'}</span>
                            </div>
                            <div class="grw-google-icon">${iconGoogle}</div>
                        </div>
                        <div class="grw-rating-row">
                            <span>${'★'.repeat(r.rating)}</span>
                            ${r.rating >= 4 ? iconCheck : ''}
                        </div>
                        <div class="grw-text">${r.text || 'O cliente recomendou este estabelecimento.'}</div>
                    </div>
                `;
            });

            html += `
                    </div>
                    <button class="grw-nav grw-next" onclick="GRWidget.move(1)">
                        <svg width="24" height="24" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                    </button>
                </div>
                <div class="grw-footer">
                    <div class="grw-footer-stats">
                        <div class="grw-footer-headline">EXCELENTE</div>
                        <div class="grw-footer-stars">★★★★★</div>
                    </div>
                    <div class="grw-footer-actions">
                        <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" width="90" style="filter: brightness(0) invert(1); opacity: 0.8; margin-top: 10px; margin-right: 20px;">
                        <a href="${writeReviewUrl}" target="_blank" class="grw-cta">Deixe sua avaliação</a>
                    </div>
                </div>
            `;

            target.innerHTML = html;
            this.setupSlider();
            this.startAutoPlay();
        },

        setupSlider: function () {
            const track = document.getElementById('grw-track');
            const originalCards = track ? track.querySelectorAll('.grw-card') : [];
            const count = originalCards.length;
            if (!track || count === 0) return;

            this.track = track;
            this.originalCount = count;

            const containerWidth = track.parentElement.offsetWidth;
            let visibleCount = (containerWidth >= 650) ? 2 : 1;
            this.visibleCount = visibleCount;

            if (count >= visibleCount) {
                for (let i = 0; i < visibleCount; i++) {
                    const firstClone = originalCards[i].cloneNode(true);
                    const lastClone = originalCards[count - 1 - i].cloneNode(true);
                    track.appendChild(firstClone);
                    track.insertBefore(lastClone, track.firstChild);
                }
                this.currentIndex = visibleCount;

                track.addEventListener('transitionend', () => {
                    if (this.currentIndex <= 0) {
                        this.currentIndex = this.originalCount;
                        this.updatePosition(false);
                    }
                    if (this.currentIndex >= this.originalCount + this.visibleCount) {
                        this.currentIndex = this.visibleCount;
                        this.updatePosition(false);
                    }
                });
            } else {
                this.currentIndex = 0;
            }

            this.updatePosition(false);
        },

        startAutoPlay: function () {
            this.stopAutoPlay();
            this.autoPlayTimer = setInterval(() => {
                this.move(1);
            }, 5000);
        },

        stopAutoPlay: function () {
            if (this.autoPlayTimer) clearInterval(this.autoPlayTimer);
        },

        updatePosition: function (animate = true) {
            if (!this.track) return;
            const singleCard = this.track.querySelector('.grw-card');
            if (!singleCard) return;
            const cardWidth = singleCard.offsetWidth + 20;

            this.track.style.transition = animate ? 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)' : 'none';
            this.track.style.transform = `translateX(-${this.currentIndex * cardWidth}px)`;
        },

        move: function (dir) {
            if (this.isMoving) return;
            this.isMoving = true;
            this.currentIndex += dir;
            this.updatePosition(true);
            setTimeout(() => { this.isMoving = false; }, 600);
        }
    };

    if (document.readyState === 'complete') window.GRWidget.init();
    else document.addEventListener('DOMContentLoaded', () => window.GRWidget.init());
})();
