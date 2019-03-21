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

class Collector {
    constructor() {
        this.posCnt = 0;
        this.sequenceLength = 25;
        this.noMovementPadding = [0, 0, 0, 0];
        this.positions = Array(this.sequenceLength).fill(this.noMovementPadding);
        this.datasets = [];
        this.load()

        document.body.addEventListener('mousemove', e => this.recordMovement(e));

    }

    train() {
        trainer.train(this.datasets)
    }

    load() {
        const stringData = localStorage.getItem('click-data')
        if (stringData) {
            this.datasets = JSON.parse(stringData)
            console.log('Initialize dataset with data sets', this.datasets.length)
        }
    }

    save() {
        const stringData = JSON.stringify(this.datasets)
        localStorage.setItem('click-data', stringData)
    }

    recordMovement(event) {
        this.posCnt++
        const pos = [event.pageX, event.pageY, event.movementX, event.movementY]
        this.positions.push(pos)
    }

    clipPositions() {
        this.posCnt = 0
        this.positions.splice(0, this.positions.length - this.sequenceLength)
    }

    createSequence(elementId) {
        const sequence = this.positions.slice(this.positions.length - this.sequenceLength, this.positions.length)

        const data = {
            x: sequence,
            y: elementId
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
        this.createSequence(element.id);
        console.log('enter', element)
    }

    mouseExit(event) {
        const element = event.currentTarget
        this.reset(element);
        console.log('exit', element)
    }

}

export const collector = new Collector();
