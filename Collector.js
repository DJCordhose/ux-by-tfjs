import {trainer} from './Trainer'

const DATA_ITEM_NAME = 'sequence-data'
const CLICK_DATA_ITEM_NAME = 'click-data'
const UN_INITIALIZED = -1;

const PREDICTION_EVENT_THRESHOLD = 1;

const PREDICTION_BUFFER_LENGTH = 25;

const EMPTY = '<EMPTY>';
const START = '<START>';

const CLICK_PATH_LENGTH = 5;

const buttonText2Id = [EMPTY, START, 'download-model', 'load-local-model',
       'reset-data', 'reset-model', 'save-model-to-local', 'show-eval',
       'show-model', 'toggle-prediction', 'toggle-visor', 'train-model',
       'upload-model'];

class Collector {
    constructor() {
        this.predictMode = false;
        this.helpMode = false;

        // trainer.load();

        this.posCnt = 0;

        this.init()

        this.load()

        document.body.addEventListener('mousemove', e => this.recordMovement(e));
        this.demoEl = document.querySelector('ux-demo')
    }



    init() {
        this.initMouseMovementData()
        this.initClickData()
    }

    initMouseMovementData() {
        this.t0 = UN_INITIALIZED;
        this.bufferLength = 200;
        this.noMovementPadding = [0, 0, 0, 0, 0];
        this.pos = this.noMovementPadding;
        this.positions = new Array(this.bufferLength).fill(this.noMovementPadding);
        this.datasets = [];
        this.eventThreshold = 0;
    }


    initClickData() {
        this.currentClickData = [];
        this.clickData = [this.currentClickData];
    }

    clearMouseMovementData() {
        this.initMouseMovementData()
        this.save()
        console.log('Mouse Movement data deleted')
    }

    clearClickData() {
        this.initClickData()
        this.save()
        console.log('Click data deleted')
    }

    train() {
        trainer.train(this.datasets)
    }

    evaluate() {
        trainer.showEvaluation(this.datasets)
    }

    togglePredict() {
        this.predictMode = !this.predictMode;
        console.log('predict mode', this.predictMode)
    }

    load() {
        const stringData = localStorage.getItem(DATA_ITEM_NAME)
        if (stringData) {
            this.datasets = JSON.parse(stringData)
            console.log('Initialize dataset with data sets: ', this.datasets.length)
        }
        const clickStringData = localStorage.getItem(CLICK_DATA_ITEM_NAME)
        if (clickStringData) {
            this.clickData = JSON.parse(clickStringData)
            console.log('Initialize click data with events: ', this.clickData.length)
        }
        this.currentClickData = [];
        this.clickData.push(this.currentClickData);
    }

    save() {
        const stringData = JSON.stringify(this.datasets)
        localStorage.setItem(DATA_ITEM_NAME, stringData)

        const clickStringData = JSON.stringify(this.clickData)
        localStorage.setItem(CLICK_DATA_ITEM_NAME, clickStringData)
    }

    recordMovement(event) {
        if (this.t0 === UN_INITIALIZED) {
            this.t0 = Date.now();
        }

        const deltaT = Date.now() - this.t0;
        this.t0 = Date.now()

        this.pos = [event.pageX, event.pageY, event.movementX, event.movementY, deltaT]
        this.positions.push(this.pos)

        this.posCnt++

        this.renderPrediction()
    }

    async renderPrediction() {
        if (this.predictMode) {
            this.eventThreshold++;
            if (this.eventThreshold >= PREDICTION_EVENT_THRESHOLD) {
                const prediction = await this.predict();
                const [b1, b2, b3] = prediction;
                const [posX, posY, deltaX, deltaY, deltaT] = this.pos;
                const demoZeroZone = posY > 300;
                if (b1 === 1.0 || b2 === 1.0 || b3 === 1.0 || demoZeroZone) {
                    // console.warn('invalid prediction')
                    this.demoEl.prediction = [0, 0, 0]
                } else {
                    // console.log(prediction)
                    this.demoEl.prediction = [b1, b2, b3];
                }
                this.eventThreshold = 0;
            }
        }
    }

    async predict() {
        const sequence = this.positionPredictionSlice();
        const prediction = await trainer.predict(sequence);
        return prediction;
    }

    clipPositions() {
        this.posCnt = 0
        this.positions.splice(0, this.positions.length - this.bufferLength)
    }

    positionSlice() {
        return this.positions.slice(this.positions.length - this.bufferLength, this.positions.length)
    }

    positionPredictionSlice() {
        return this.positions.slice(this.positions.length - PREDICTION_BUFFER_LENGTH, this.positions.length)
    }

    createSequence(category) {
        if (this.predictMode) {
            return;
        }

        const sequence = this.positionSlice();

        const data = {
            x: sequence,
            y: category
        }
        this.datasets.push(data)

        console.log('Length of click path since previous hit', this.posCnt)
        console.log('Total number of datasets', this.datasets.length)

        this.clipPositions()
        this.save()

        this.t0 = Date.now()
    }

    highlight(element) {
        element.setAttribute('theme', 'primary');
    }

    reset(element) {
        element.removeAttribute('theme');
    }

    mouseEnter(event) {
        const element = event.currentTarget
        this.highlight(element);
        const category = parseInt(element.id[1])
        this.createSequence(category);
        console.log('enter', element)
    }

    mouseExit(event) {
        const element = event.currentTarget
        this.reset(element);
        console.log('exit', element)
    }

    recordClick(event) {
        const element = event.currentTarget
        const id = element.id;
        this.currentClickData.push(id);
        this.save();

        console.log(id);
        return id;
   
    }

    toggleHelp() {
        console.log('Toggle Help');
        this.helpMode = !this.helpMode;
        console.log('help mode', this.helpMode)
        this.renderHelp()

    }

    buttonId2Num(buttonId) {
        return buttonText2Id.lastIndexOf(buttonId);
    }

    async predictHelp() {
        let sequence = this.clickData[this.clickData.length - 1];
        sequence = ['<EMPTY>', '<EMPTY>', '<EMPTY>', '<EMPTY>', '<START>'].concat(sequence);
        sequence = sequence.slice(sequence.length - CLICK_PATH_LENGTH, sequence.length)
        sequence = sequence.map(id => this.buttonId2Num(id));

        const prediction = await trainer.predictClick(sequence);
        return prediction;
    }

    async renderHelp() {
        if (this.helpMode) {
                console.log('rendering help')

                const prediction = await this.predictHelp();
                const probas = {'download-model': prediction[2], 'load-local-model': prediction[3],
                'reset-data': prediction[4], 'reset-model': prediction[5], 'save-model-to-local': prediction[6], 'show-eval': prediction[7],
                'show-model': prediction[8], 'toggle-prediction': prediction[9], 'toggle-visor': prediction[10], 'train-model': prediction[11],
                'upload-model': prediction[12]};
                console.log(probas);
                this.demoEl.probas = probas;
            }
    }


}

export const collector = new Collector();
