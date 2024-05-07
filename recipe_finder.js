class RecipeFinder {
    constructor(data) {
        this.step = 0;
        this.status = 0;
        this.stepResult = '';
        this.type = 'vl';
        this.el = {
            container: document.querySelector('[data-findRecipe-container]'),

            stepDot: document.querySelector('[data-step]'),
            stepTitle: document.querySelector('[data-step-title]'),
            stepTitleNumber: document.querySelector('[data-step-title-number]'),
            stepCards: document.querySelector('[data-step-cards]'),
            prevButton: document.querySelector('[button-prev] a'),
            stepCont: document.querySelector('.step-cont'),
            choiceCont: document.querySelector('.choice-cont'),
            resultCont: document.querySelector('.result-cont'),

            choiceTitle: document.querySelector('[data-choice-title]'),
            choiceSubTitle: document.querySelector('[data-choice-sub-title]'),
            choiceCards: document.querySelector('[data-choice-cards]'),

            resultTitle: document.querySelector('[data-result-title]'),
            resultSubTitle: document.querySelector('[data-result-sub-title]'),
            resultDesc: document.querySelector('[data-result-desc]'),
            resultImage: document.querySelector('[data-result-image] img'),
            resultIngredientsTitle: document.querySelector('[data-result-ingredients-title]'),
            resultIngredientsDesc: document.querySelector('[data-result-ingredients-desc]'),
            resultHowToMake: document.querySelector('[data-result-how-to-make]'),

            restartButton: document.querySelector('[button-restart]'),
            shareButton: document.querySelector('[button-share]'),
            skuCount: document.querySelector('#sku-count'),
            addCartButton: document.querySelector('[button-add-cart]'),

            plusButton: document.querySelector('[button-plus]'),
            minusButton: document.querySelector('[button-minus]'),

            otherType: document.querySelector('[data-other-type]'),
        };

        const { renderStep } = this;

        this.stepData = data.step;
        this.choiceData = data.result;

        this.render = {
            all: this.renderAll.bind(this),
            step: renderStep.bind(this),
            prevButton: this.renderPrevButton.bind(this),
            cards: this.renderCards.bind(this),
            page: this.renderPage.bind(this),
            choiceTitle: this.renderChoiceTitle.bind(this),
            choice: this.renderChoice.bind(this),
            resultTitle: this.renderResultTitle.bind(this),
            result: this.renderResult.bind(this),
            otherType: this.renderOtherTypeButton.bind(this),
        };

        this.init();
    }

    init() {
        const { prevButton, restartButton, shareButton, addCartButton, skuCount, plusButton, minusButton, otherType } = this.el;
        prevButton.addEventListener('click', this.prevStep.bind(this));
        prevButton.style.cursor = 'pointer';

        restartButton.addEventListener('click', this.restart.bind(this));
        restartButton.style.cursor = 'pointer';
        shareButton.addEventListener('click', this.share.bind(this));

        plusButton.addEventListener('click', () => {
            skuCount.value = parseInt(skuCount.value) + 10;
        });

        minusButton.addEventListener('click', () => {
            if (parseInt(skuCount.value) > 1) {
                skuCount.value = parseInt(skuCount.value) - 10;
            }
        });
        addCartButton.addEventListener('click', this.addCart.bind(this));

        otherType.addEventListener('click', this.changeType.bind(this));

        this.renderAll();

        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const result = urlParams.get('result');
        const type = urlParams.get('type');

        if (result && type) {
            this.step = 2;
            this.stepResult = result;
            this.status = 2;
            this.type = type;

            this.render.resultTitle();
            this.render.result();
            this.render.page();
        } else {
            const url = `${window.location.origin}${window.location.pathname}`;
            window.history.pushState({ path: url }, '', url);
        }
    }

    changeType() {
        this.type = this.type === 'vl' ? 'ol' : 'vl';
        this.el.skuCount.value = 0;
        this.render.resultTitle();
        this.render.otherType();
        this.render.result();

        const queryString = `result=${this.stepResult}&type=${this.type}`;
        const url = `${window.location.origin}${window.location.pathname}?${queryString}`;
        history.pushState({ path: url }, '', url);
    }

    addCart() {
        if(this.el.skuCount.value === '0'){
            return;
        }

        if (window.CartManager) {
            window.CartManager.updateItem(this.choiceData[this.stepResult][this.type].sku, this.el.skuCount.value).then(() => {
                alert('장바구니에 추가되었습니다.');
            });
        }else{
            alert(`
프로덕트 환경이 아니거나 window.CartManager가 선언되지 않았습니다.

장바구니에 추가될 제품은 다음과 같습니다.
제품명: ${this.choiceData[this.stepResult][this.type].ingredientsTitle}
SKU: ${this.choiceData[this.stepResult][this.type].sku}
수량: ${this.el.skuCount.value}
            `);
        }
    }

    share() {
        // url copy
        const url = window.location.href;
        const tempElem = document.createElement('textarea');
        document.body.appendChild(tempElem);
        tempElem.value = url;
        tempElem.select();
        document.execCommand('copy');
        document.body.removeChild(tempElem);

        alert('URL이 복사되었습니다.');
    }

    restart() {
        this.step = 0;
        this.stepResult = '';
        this.status = 0;
        this.el.skuCount.value = 0;
        this.type = '';

        const url = `${window.location.origin}${window.location.pathname}`;
        window.history.pushState({ path: url }, '', url);

        window.scrollTo(0, 0);
        this.renderAll();
    }

    async nextStep(direction) {
        await new Promise((resolve) => {
            const targetCard = this.el.stepCards.querySelector(`.${direction}`);
            const otherCard = this.el.stepCards.querySelector(`.${direction === 'left' ? 'right' : 'left'}`);
            targetCard.style.left = '50%';
            targetCard.style.transition = 'all 0.5s';
            targetCard.style.transform = 'translateX(-50%)';

            otherCard.style.transition = 'opacity 0.5s';
            otherCard.style.opacity = 0;
            setTimeout(() => {
                resolve();
            }, 600);
        });

        await new Promise((resolve) => {
            this.el.stepCards.style.position = 'relative';
            this.el.stepCards.style.opacity = 0;
            this.el.stepCards.style.transition = 'all 0.3s';
            this.el.stepCards.style.transform = 'translateY(-20px)';

            setTimeout(() => {
                resolve();
            }, 300);
        });

        if (this.step === 2) {
            this.status = 1;
            this.render.page();
            this.render.choiceTitle();
            this.render.choice();

            this.el.stepCards.style.position = 'static';
            this.el.stepCards.style.opacity = 1;
            this.el.stepCards.style.transition = 'all 0.3s';
            this.el.stepCards.style.transform = 'translateY(0)';
            this.el.stepCards.style.transform = 'none';
            
            return;
        }
        this.step++;
        this.renderAll();

        await new Promise((resolve) => {
            this.el.stepCards.style.transform = 'translateY(40px)';
            setTimeout(() => {
                resolve();
            }, 100);
        });


        await new Promise((resolve) => {
            this.el.stepCards.style.position = 'static';
            this.el.stepCards.style.opacity = 1;
            this.el.stepCards.style.transition = 'all 0.3s';
            this.el.stepCards.style.transform = 'translateY(0)';
            this.el.stepCards.style.transform = 'none';

            setTimeout(() => {
                resolve();
            }, 300);
        });
    }

    prevStep() {
        if (this.step === 0) return;
        this.step--;
        this.stepResult = this.stepResult.slice(0, -1);

        this.renderAll();
    }

    async finalStep(type) {
        await new Promise((resolve) => {
            const targetCard = this.el.choiceCards.querySelector(`.${type}`);
            const otherCard = this.el.choiceCards.querySelector(`.${type === 'ol' ? 'vl' : 'ol'}`);

            targetCard.style.transition = 'width 0.5s';
            otherCard.style.transition = 'width 0.5s';
            
            targetCard.style.zIndex = 2;
            otherCard.style.zIndex = 1;

            if(type === 'vl'){
                targetCard.style.left = 'auto';
                targetCard.style.right = '0';
            }

            targetCard.style.width = '100%';

            setTimeout(() => {
                resolve();
            }, 750);
        });

        this.status = 2;
        this.type = type;

        this.render.resultTitle();
        this.render.result();
        this.render.otherType();
        this.render.page();

        const queryString = `result=${this.stepResult}&type=${this.type}`;
        const url = `${window.location.origin}${window.location.pathname}?${queryString}`;
        history.pushState({ path: url }, '', url);

        window.scrollTo(0, 0);
    }

    renderAll() {
        this.render.step();
        this.render.prevButton();
        this.render.cards();
        this.render.otherType();
        this.render.page();
    }

    renderStep() {
        const { step, stepData, el } = this;
        const { stepDot, stepTitle, stepTitleNumber } = el;

        const stepLis = stepDot.querySelectorAll('li');
        stepLis.forEach((li) => {
            li.classList.remove('active');
        });
        stepLis[step].classList.add('active');
        stepTitleNumber.innerHTML = `STEP${step + 1}`;
        stepTitle.innerHTML = stepData[step].title;
    }

    renderChoiceTitle() {
        const { choiceData, el } = this;
        const { choiceTitle, choiceSubTitle } = el;

        choiceTitle.innerHTML = choiceData[this.stepResult].vl.title;
        choiceSubTitle.innerHTML = choiceData[this.stepResult].vl.subTitle;
    }

    renderResultTitle() {
        const { choiceData, el } = this;
        const { resultTitle, resultSubTitle, resultDesc } = el;

        resultTitle.innerHTML = choiceData[this.stepResult][this.type].title;
        resultSubTitle.innerHTML = choiceData[this.stepResult][this.type].subTitle;
        resultDesc.innerHTML = choiceData[this.stepResult][this.type].desc;
    }

    renderPrevButton() {
        if (this.step === 0) {
            this.el.prevButton.style.visibility = 'hidden';
        } else {
            this.el.prevButton.style.visibility = 'visible';
        }
    }

    renderCards() {
        const { step, el } = this;
        const { stepCards } = el;
        const cards = this.stepData[step].cards;

        stepCards.id = `stpe0${step + 1}`;

        stepCards.innerHTML = '';

        const left = document.createElement('div');
        left.classList.add('left');
        const a = document.createElement('a');
        a.classList.add('card');
        const p = document.createElement('p');
        p.innerHTML = cards[0].text;
        const img = document.createElement('img');
        img.src = cards[0].imgUrl;

        a.append(p, img);
        left.appendChild(a);

        const right = document.createElement('div');
        right.classList.add('right');
        const a2 = document.createElement('a');
        a2.classList.add('card');
        const p2 = document.createElement('p');
        p2.innerHTML = cards[1].text;
        const img2 = document.createElement('img');
        img2.src = cards[1].imgUrl;

        a2.append(p2, img2);
        right.appendChild(a2);

        a.addEventListener('click', () => {
            this.stepResult += cards[0].id;
            this.nextStep('left');
        });

        a2.addEventListener('click', () => {
            this.stepResult += cards[1].id;
            this.nextStep('right');
        });

        stepCards.append(left, right);
    }

    async renderChoice() {
        await new Promise((resolve) => {
            this.el.choiceCont.style.transition = 'all 0.3s';
            this.el.choiceCont.style.transform = 'translateY(30px)';
            this.el.choiceCont.style.opacity = 0;
            
            setTimeout(() => {
                resolve();
            }, 100);
        });
        
        await new Promise((resolve) => {

            this.el.choiceCont.style.transform = 'translateY(0)';
            this.el.choiceCont.style.opacity = 1;

            setTimeout(() => {
                resolve();
            }, 300);
        });

        this.el.choiceCards.innerHTML = '';

        const div = document.createElement('div');
        div.classList.add('card', 'ol');
        const a = document.createElement('a');
        const p = document.createElement('p');
        const img = document.createElement('img');
        img.src = 'img/type_ol.png';
        p.appendChild(img);
        p.innerHTML += '<span>오리지널 레시피 보기</span>';
        a.appendChild(p);

        const img2 = document.createElement('img');
        img2.src = 'img/chiaro_ol.jpg';
        a.appendChild(img2);
        div.appendChild(a);

        const div2 = document.createElement('div');
        div2.classList.add('card', 'vl');
        const a2 = document.createElement('a');
        const p2 = document.createElement('p');
        const img3 = document.createElement('img');
        img3.src = 'img/type_vl.png';
        p2.appendChild(img3);
        p2.innerHTML += '<span>버츄오 레시피 보기</span>';
        a2.appendChild(p2);

        const img4 = document.createElement('img');
        img4.src = 'img/chiaro_vl.jpg';
        a2.appendChild(img4);
        div2.appendChild(a2);

        div.addEventListener('click', () => {
            this.finalStep('ol');
        });

        div2.addEventListener('click', () => {
            this.finalStep('vl');
        });

        this.el.choiceCards.append(div, div2);
    }

    renderResult() {
        const { choiceData, el } = this;
        const { resultIngredientsTitle, resultIngredientsDesc, resultImage, resultHowToMake } = el;

        resultImage.src = choiceData[this.stepResult][this.type].resultImgSrc;

        resultIngredientsTitle.innerHTML = choiceData[this.stepResult][this.type].ingredientsTitle + ' 캡슐 1개';
        resultIngredientsDesc.innerHTML = choiceData[this.stepResult][this.type].ingredientsDesc;

        resultHowToMake.innerHTML = '';
        choiceData[this.stepResult][this.type].howToMake.forEach((li) => {
            const div = document.createElement('div');
            div.innerHTML = li;
            resultHowToMake.appendChild(div);
        });
    }

    renderPage() {
        const { container, stepCont, choiceCont, resultCont } = this.el;

        stepCont.style.display = 'none';
        choiceCont.style.display = 'none';
        resultCont.style.display = 'none';

        const statusPages = [stepCont, choiceCont, resultCont];

        statusPages[this.status].style.display = 'block';

        if(this.status === 2){
            container.style.display = 'none';
        }else{
            container.style.display = 'block';
        }
    }

    renderOtherTypeButton() {
        const { otherType } = this.el;
        
        if(this.type === 'vl'){
            otherType.innerHTML = '<a><img src="img/btn_next.png" alt=""><img src="img/type_ol.png" alt=""></a>';
        }else{
            otherType.innerHTML = '<a><img src="img/btn_next.png" alt=""><img src="img/type_vl.png" alt=""></a>';
        }
    }
}
