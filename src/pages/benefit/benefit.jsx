import React from 'react';
import styles from '../../css/benefit/benefit.module.css';
import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import SkeletonPage from '../../components/LoadingSkeleton';
import 'react-loading-skeleton/dist/skeleton.css';


// importing images

// importing components
import FirstComponent from './1stcomponent';
import TwoComponent from './2stcomponent';



// importing images
export default function benefit () {

    return (
        <div className={styles.page}>
            <FirstComponent />
            <TwoComponent />
        </div>
    );
}