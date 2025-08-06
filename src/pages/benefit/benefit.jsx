import React from 'react';
import styles from '../../css/benefit/benefit.module.css';
import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
// import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// importing images
import main from "../../img/main.jpg";
import Benefit from "../../img/benefit.jpg";
import Securities from "../../img/Securities.jpg";
import shopping from "../../img/shopping.jpg";
import hamburger from "../../img/hamburger.jpg";

// importing components
import Home from '../Home/Home';
// importing images
export default function benefit () {

    return (
        <div className={styles.container}>
            <div>
                <video src=""></video>
            </div>
            <div className={styles.btncontainer}>
                <ul>
                    {[{
                        to: "/Home",
                        img: main,
                        label: "홈"
                    }, {
                        to: "/benefit",
                        img: Benefit,
                        label: "혜택"
                    }, {
                        to: "/shopping",
                        img: shopping,
                        label: "토스쇼핑"
                    }, {
                        to: "/securities",
                        img: Securities,
                        label: "증권"
                    }, {
                        to: "/all",
                        img: hamburger,
                        label: "전체"
                    }].map(({ to, img, label }) => (
                    <li key={to}>
                        <NavLink to={to} className={({ isActive }) => isActive ? styles.active : ""}>
                            <img src={img} alt={label} /> {label}
                        </NavLink>
                    </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}