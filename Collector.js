/*


This is specific to how my input device works (this does not work for touch)
- using trackpad
- windows / mac / linux
- using mouse
- speed of input device

And personal style
- beginner / expert
- fast / slow
- direct / curvy

*/

import {trainer} from './Trainer'

const DATA_ITEM_NAME = 'sequence-data'

class Collector {
    constructor() {
        this.predictMode = true;
        this.posCnt = 0;
        this.sequenceLength = 25;
        this.paddingLength = 15;
        this.noMovementPadding = [0, 0, 0, 0];
        this.positions = Array(this.bufferLength).fill(this.noMovementPadding);
        this.datasets = [];
        this.load()

        document.body.addEventListener('mousemove', e => this.recordMovement(e));

        this.demoEl = document.querySelector('ux-demo')

    }

    get bufferLength() {
        return this.sequenceLength + this.paddingLength;
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
        this.posCnt++
        const pos = [event.pageX, event.pageY, event.movementX, event.movementY]
        this.positions.push(pos)
        this.renderPrediction()
    }

    async renderPrediction() {
        if (this.predictMode) {
            const prediction = await this.predict();
            const [_, b1, b2, b3] = prediction;
            if (b1 === 1.0 || b2 === 1.0 || b3 === 1.0) {
                // console.warn('invalid prediction')
                this.demoEl.prediction = [0.33, 0.33, 0.33]
            } else {
                // console.log(prediction)
                this.demoEl.prediction = [b1, b2, b3];
            }
        }
    }

    async predict() {
        const sequence = this.positionSlice();
        const prediction = await trainer.predict(sequence);
        return prediction;
    }

    clipPositions() {
        this.posCnt = 0
        this.positions.splice(0, this.positions.length - this.bufferLength)
    }

    positionSlice() {
        return this.positions.slice(this.positions.length - this.sequenceLength, this.positions.length)
    }

    positionSlicePadded() {
        return this.positions.slice(this.positions.length - this.bufferLength, this.positions.length - this.paddingLength)
    }

    createSequence(category) {
        if (this.predictMode) {
            return;
        }

        const sequence = this.positionSlicePadded();

        const data = {
            x: sequence,
            y: category
        }
        this.datasets.push(data)

        console.log('Length of click path since previous hit', this.posCnt)
        console.log('Total number of datasets', this.datasets.length)

        this.clipPositions()
        this.save()
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
