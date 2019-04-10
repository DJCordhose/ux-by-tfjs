---
title: Improving User Experience with TensorFlow.js
published: false
description: 
tags: tensorflow.js, ux, ml
---

# Improving User Experience with TensorFlow.js

Imagine you have an application with some buttons or other interactive elements. To make clear which button you would click they often highlight when you click on them. Much like this 

![Buttons highlighting when hovering over them](https://raw.githubusercontent.com/DJCordhose/ux-by-tfjs/master/img/app.gif "Our Application")

Now imagine we would be able to highlight the interactive element *before* you hover over it. This might be useful for at least two reasons

1. Prepare resources in advance
   * toggle lazy loading of images or iframes to eager earlier (
https://dev.to/ben/native-lazy-loading-for-img-and-iframe-is-coming-to-the-web-55on)
   * Serverless function pre-start
   * Module pre-load
   * AR: where would people look at soon? render more details
2. (unnoticeably) highlight button to make it easier to access for user

![Buttons highlighting when the machine thinks I am going to click them soon](https://raw.githubusercontent.com/DJCordhose/ux-by-tfjs/master/img/simpleRNN.gif "Highlighting in Advance")


![Screenshot from dev tools of mouse sequence data in local storage](https://raw.githubusercontent.com/DJCordhose/ux-by-tfjs/master/img/mouse-positions.png "Mouse Sequence Data")

```javascript

this.model = tf.sequential();
this.model.add(
    tf.layers.simpleRNN({
        inputShape: [SEGMENT_SIZE, N_FEATURES],
        units: 50,
        activation: 'tanh',
        dropout: 0.1
    }));


```
