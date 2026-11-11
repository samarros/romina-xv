import { Butterfly, Petal, RoseBouquet, Sparkle } from './Ornaments';
import styles from './DecorativeElements.module.css';

export function DecorativeElements() {
  return <div className={styles.scene} aria-hidden="true" data-animation="ornaments">
    <RoseBouquet className={styles.roses} data-layer="flowers" data-motion="ambient-flower" />
    <Butterfly className={styles.butterfly} data-layer="butterfly" />
    <Petal className={`${styles.petal} ${styles.petalOne}`} data-layer="petal" />
    <Petal className={`${styles.petal} ${styles.petalTwo}`} data-layer="petal" />
    <Petal className={`${styles.petal} ${styles.petalThree}`} data-layer="petal" />
    <Sparkle className={`${styles.sparkle} ${styles.sparkleOne}`} data-layer="sparkle" />
    <Sparkle className={`${styles.sparkle} ${styles.sparkleTwo}`} data-layer="sparkle" />
  </div>;
}
