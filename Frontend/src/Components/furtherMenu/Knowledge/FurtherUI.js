import React, {Fragment} from 'react';
import styles from './furtherUI.module.css';
import {significantSteps} from './KnowledgeData';

{/* // significant steps */}

<section className={styles.significantSection}>
      <h2 className={styles.significantTitle}>Significant things you wouldn't want to miss</h2>
      <div className={styles.significantItemsWrapper}>
        {significantSteps.map((item, idx) => (
          <div className={styles.significantItemCard} key={idx}>
            <img src={item.icon} alt={item.title} className={styles.icon} />
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </section>