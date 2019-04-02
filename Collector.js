import {trainer} from './Trainer'

const DATA_ITEM_NAME = 'sequence-data'
const UN_INITIALIZED = -1;

const PREDICTION_EVENT_THRESHOLD = 1;

const PREDICTION_BUFFER_LENGTH = 25;

class Collector {
    constructor() {
        this.predictMode = false;
        // trainer.load();
        this.posCnt = 0;
        this.t0 = UN_INITIALIZED;
        this.bufferLength = 200;
        this.noMovementPadding = [0, 0, 0, 0, 0];
        this.pos = this.noMovementPadding;
        this.positions = new Array(this.bufferLength).fill(this.noMovementPadding);
        this.datasets = [];
        this.eventThreshold = 0;
        
        this.load()

        document.body.addEventListener('mousemove', e => this.recordMovement(e));

        this.demoEl = document.querySelector('ux-demo')

    }

    train() {
        trainer.train(this.datasets)
    }

    togglePredict() {
        this.predictMode = !this.predictMode;
        console.log('predict mode', this.predictMode)
    }

    load() {
        const stringData = localStorage.getItem(DATA_ITEM_NAME)
        if (stringData) {
            this.datasets = JSON.parse(stringData)
            console.log('Initialize dataset with data sets', this.datasets.length)
        }
    }

    save() {
        const stringData = JSON.stringify(this.datasets)
        localStorage.setItem(DATA_ITEM_NAME, stringData)
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
                const demoZeroZone = posY < 225;
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

}

export const collector = new Collector();
