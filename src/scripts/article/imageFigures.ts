/**
 * CustomImage を通らなかった本文画像を <figure> で包み、title（なければ alt）を連番キャプションにする。
 */
export function setupImageFigures() {
  const images = document.querySelectorAll('.prose img:not(.blog-figure-img)');

  images.forEach((img, index) => {
    // Avoid processing the same image twice
    if (img.parentElement?.tagName.toLowerCase() === 'figure') return;

    const altText = img.getAttribute('alt');
    const titleText = img.getAttribute('title');

    // title属性があればキャプションとして使い、なければalt属性をフォールバックとして使う
    const captionText = titleText || altText;
    const showCaption = captionText && captionText.trim().length > 0;

    const figure = document.createElement('figure');
    figure.className = 'blog-figure';

    // Insert figure before img, then move img into figure
    img.parentNode?.insertBefore(figure, img);

    // Add a specific class to prevent reprocessing or conflict with other img styles
    img.classList.add('blog-figure-img');
    figure.appendChild(img);

    if (showCaption) {
      const figcaption = document.createElement('figcaption');
      figcaption.innerHTML = `<span class="figure-number">図${index + 1}: </span>${captionText}`;
      figure.appendChild(figcaption);
    }
  });
}
