import React from 'react';
import styles from '../../css/benefit/benefit.module.css';
import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import SkeletonPage from '../../components/LoadingSkeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// importing images
import main from "../../img/main.jpg";
import BenefitBlack from "../../img/benefit-black.jpg";
import Securities from "../../img/Securities.jpg";
import shopping from "../../img/shopping.jpg";
import hamburger from "../../img/hamburger.jpg";

// importing components
import Home from '../Home/Home';
import TabBar from '../tabbar'



// importing images
export default function benefit () {

    const [loading, setLoading] = useState(true);

    useEffect(() => {
    const timer = setTimeout(() => {
        setLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
    }, []);
    
    if (loading) return <SkeletonPage />;


    return (
        <div className={styles.container}>
            <TabBar />
        </div>
    )
}