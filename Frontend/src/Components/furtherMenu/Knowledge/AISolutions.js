


import React from 'react';
import classes from './AiSolutions.module.css'
import { FaPlus, FaSearch,FaCheckCircle } from "react-icons/fa";
import chariot from '../../../src/assets/chariot.png'
import  Robo from '../../assets/robo.png'
import Counter from '../../assets/counterimage.png'
import Union from '../../assets/Union.png'
import Cart from '../../assets/Union2.png'


const AiSolutions = ()=>{
  const item = [
    'Tacodeli',
    'CHARIOT',
    'Tacodeli',
    'Liquibase.org'
]

  
  return(
   
    <section className={classes.section}>
      <h4 className={classes.subheading}>OUR PRODUCT</h4>
      <h2 className={classes.heading}>Recent AI solutions Product</h2>
      <p className={classes.description}>
        There are many variations of passages of Lorem Ipsum are many variations of passages of lorem Ipsum available but .suffered.
      </p>

      <div className={classes.cardsWrapper}>
        {/* LEFT CARD */}
        <div className={classes.leftcard}>
          <div className={classes.content}>
            <h3>AI-Powered Business Solutions</h3>
            <p>
              <a href="#">AI chat bot</a> we are dedicated is the safeguarding your digital.
            </p>

            <ul className={classes.features}>
              <li><FaCheckCircle className={classes.icon} /> Advanced automation & analytics</li>
              <li><FaCheckCircle className={classes.icon} /> API access with higher rate limits</li>
            </ul>

            <button className={classes.demoButton}>
              <FaPlus /> Get a Demo
            </button>
          </div>

          <div className={classes.image}>
            <img src={'3'} alt="AI Solution" />
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className={classes.rightcard}>
          <div className={classes.image}>
            <img src={'2'} alt="Statistics Illustration" />
          </div>

          <div className={classes.statsBox}>
            <div className={classes.statItem}>
              <h3>25k+</h3>
              <p>Project Complete</p>
            </div>
            <div className={classes.statItem}>
              <h3>40m+</h3>
              <p>Data Inducted</p>
            </div>
          </div>
        </div>
      </div>
    </section>


  )
}

export default AiSolutions