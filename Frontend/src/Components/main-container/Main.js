// import React, { useState } from "react"

// import mainImage from "../../assets/hero-img.webp"
import styles from "./Main.module.css"
import NavBar from "../head/Navbar"
import Conversationchatbot from "./Conversationchatbot";
import MainNextSection from "./MainNextsection";
import images from "../../assets/images"; 


const Main=() =>{
  return (
    <>
    <NavBar/>
    <section className={styles.heroSection}>
      <img src={images.heroImage} alt="background" className={styles.bgImage} />

      <div className={styles.overlay}>
        <img src={images.circle} alt="chat bubble" className={styles.circle} />
        <img src={images.triangle} alt="tri icon" className={styles.triangle} />
        <img src={images.robot} alt="robot icon" className={styles.robot} title="Hii👋"/>
        <img src={images.circle2} alt="robot icon" className={styles.circle2} />
        <img src={images.comment} alt="robot icon" className={styles.comment} />
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>
          AI <span className={styles.falldown}>Artificial Intelligence</span> & AI Technology <br />
          <span className={styles.gradientText}>Startups Template</span>
        </h1>
        <p className={styles.subtitle}>
          Elevate your website development expertise and supercharge your efficiency.
        </p> 
        <button className={styles.herobutton}>View Demo →</button>
      </div>
    </section>
        <MainNextSection/>
        <Conversationchatbot/>
  
    </>
  )
}

export default Main






