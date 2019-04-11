## javascript-gif

> Чтение и разбор по кадрам GIF-анимаций (es-module)

#### Подключение
```javascript
import Gif from '/javascript-gif/Gif.js';
```

#### Использование

Загрузка GIF по URL
```javascript
const src = '/path/to/animation.gif';
const gif = await Gif.fetch(src);

console.log(gif.frames); // список кадров GIF
```

---

Получение GIF из RAW-данных (`{Uint8Array}`)
```javascript
const buffer = ArrayBuffer(...);

const data = new Uint8Array(buffer);
const gif  = await Gif.raw(data);

console.log(gif.frames); // список кадров GIF
```

---

Доступные методы и поля
```javascript
gif.size   // Vector2d -> {x, y}
gif.frames // array of {data: ImageData, delay: number (ms)}
gif.length // gif.frames.length
```

Пример - Рисование кадра `index`
```javascript
const frame = gif.frames[index].data;
context.putImageData(frame, 0, 0);
```

---

### Управление воспроизведением GIF (дополнительно)

```javascript
import Player from '/javascript-gif/Player.js';
```

> класс `Player` создан в демонстрационных целях, крайне рекомендуется в ваших проектах управлять воспроизведением GIF самостоятельно

```javascript
const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

const player = new Player(gif);
player.init(context).resize().render(); // рисование GIF

// доступные методы
player.play()
player.pause()
player.render(absoluteIndex)
player.shift(relativeIndex)
```
