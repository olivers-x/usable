import { StrictMode, Suspense, use, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createUsable } from "../src/index.js";

type Post = { id: number; title: string; body: string };

const usablePost = createUsable(async (): Promise<Post> => {
  console.log("only runs once when invoked by react api use");
  const raw = await fetch(`https://jsonplaceholder.typicode.com/posts/23`);
  return raw.json();
});

function Post() {
  const [isActive, setIsActive] = useState(false);

  if (!isActive) {
    return <button onClick={() => setIsActive(true)}>Activate</button>;
  }

  const post = use(usablePost);

  return (
    <>
      <button onClick={() => setIsActive(false)}>Deactivate</button>
      <article>
        <h2>{post.title}</h2>
        <p>{post.body}</p>
      </article>
    </>
  );
}

function App() {
  return (
    <main>
      <h1>Example of Usable</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <Post />
      </Suspense>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
