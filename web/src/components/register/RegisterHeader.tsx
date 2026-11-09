import { Tagline } from "./Tagline";
import { rise } from "./ui/rise";
import styles from "./RegisterHeader.module.css";

/** Status pill, event name and the typed tagline. */
export function RegisterHeader() {
  const pill = rise(0);
  const title = rise(0.1);

  return (
    <header className={styles.head}>
      <div className={`${styles.pill} ${pill.className}`} style={pill.style}>
        <span className={styles.dot} />
        Registrations open
      </div>
      <h1 className={`${styles.title} ${title.className}`} style={title.style}>
        PromptArena
      </h1>
      <Tagline />
    </header>
  );
}
