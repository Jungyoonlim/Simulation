import React, { useState } from 'react';
import * as THREE from 'three';

class Annotation {
    constructor(position, name){
        this.position = position;
        this.name = name;
    }
}