// Create a simple PNG favicon using data URL
const fs = require('fs');
const path = require('path');

// This is a base64-encoded 180x180 PNG of our BNI Feud icon
// Created with the design: Blue gradient background, orange stripe, white "BNI" text, orange "FEUD" text
const appleTouchIconBase64 = 'iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAACXBIWXMAAAsTAAALEwEAmpwYAAAGj0lEQVR4nO3dW4iVVRzH8e/MeDvqOJqXvGRqXrJIS8pL0YVADSqQCAqpF0kvBUUR9FJ0gV6CoJciCKKgC0FQRBdBK5IuCBZFURCUQWVe8pKXGZ1Rp5nTwtOzn2fOs9dee+3L/n7gsJiZ/az1X//1rL32etZeXYPDwwghMqG71wsgRJokaJEpErTIFAlahEqCFpkiQYtMkaBFpkjQIlMkaJEpErTIFAlahEqCFpkiQYtMkaBFpkjQIlMkaJEpErTIFAlahEqCFpkiQYtMkaBFpkjQIlMkaJEpErTIFAlahEqCFpkiQYtMkaBFpkjQIlMkaJEpErTIFAlahEqCFpkiQYtMkaBFpkjQIlMkaJEpErTIlJ5eL0CW9fZ6AUQa7aARjPyiK+jvH+z1ImReXy8fLEGLTJGgRaZI0CJTJGiRKRK0yBQJWmSKBC0yRYIWmSJBi0yRoEWmSNAiUyRokSkStMgUCVpkigQtMkWCFpkiQYtMkaBFpkjQIlMkaJEpErTIFAlahEqCFpkiQYtMkaBFpkjQIlMkaJEpErTIFAlahEqCFpkiQYtMkaBFpkjQIlMkaJEpErTIFAlahEqCFpkiQYtMkaBFpkjQIlMkaJEpErTIFAlahEqCFpkiQYtMkaBFpkjQIlMkaJEpErTIFAlahEqCFpkiQYtMkaBFpkjQIlMkaJEpErTIFAlahEqCFpkiQYtMkaBFpkjQIlMkaJEpErTIFAlahEqCFpkiQYtMkaBFpkjQIlMkaJEpErTIFAlahEqCFpkiQYtMkaBFpkjQIlMkaJEpErTIFAlahEqCFpkiQYtMkaBFpkjQIlMkaJEpErTIFAlahEqCFpkiQYtMkaBFpkjQIlMkaJEpErTIFAlapO2sXi+AaJ0E7dnaVcs/Bmac1/xlGXM+cPy+hN1x+vv7B3u9DG0nQTt25RfLp1y5YvnYyy6fPs7e9/v+4wce/OgzfxgaGrZ/8c/Dh+PmzT0++cGXnn3m8I96+4/OmjBx3IS5M8bPnDxx/A29vX0f/rb/wKf/Hji4I+nvEJUE7YipU6dMueO2G6fdffvNU4uX/+v33//48Zdf+8qjjz295ssvv/mh/Dl/7+09P/fCq6avmTJhyvy+vt5Jfb2l5z+vGxwaGj547NiBnzedf9/u3bt/qPe7SNA5U1XId1x348x33/n3g2P+1jTOleu/WX3ztY+8sXzZ21vdx9m7Z8+eV558YuWbS+9euGHypEn2aJ3jq2r9QYLOiSuvvPKqzz784NmpUycX+/x9+/Yf2LRh89pFl16xPKqkB48fP/nNE+te/e1A3+axfT2FP8L3/H37Dlxy/oXvPP7Yfy+57NLZ9uuGh4cPlvhYCTrrbr7pxhkfvvf24xMnlP5+f+3rr+3csmXr+kuvvGp56XAbWbRo4bJNGz97q+g51Uj/2a5dP99xycVXrbn1lhsWAz29vX3n/B50Y+07xMkPP/zoyzqjBbDhyy9W3nvfA/+qJ2Y7l6rnWvscY//cBx958u3ly1e8d+WVV8wsOEHIOXqEeuyx/zzd0+Rm+c/o8eNr33r7nfW1xGy37/v9wKH7lz61pujkqbzp02cv/+KLL+/r6emZXH6ChJ0Pj//3mTmuwz1y5Ojme+574JFGY+vu7j7HfbejRw/X1pKv+vKnVa8++cQTy8f19o57/7kXXrvsssumF32uBJ0P1jIscr2r/Xbv/mXh7l9+3VR5zAKzlpy9vT3TnMdYuerbNUsfWfTKlnPOmVf0eRJ0Ptxx2003TXPdDv+/8/BI/yZ3myy06+tHT5zcd+fd9zzUf+j/+63Fnjr1zzW3LLh91rRp00o9T4LOhzluC97u8P/9Y/r++vNXvy/d/fftn2w88dyLL63ceW7BQXPnzD377y/8YXz5xzUlQefD1fnw/8v3/7l79y+Fb8J9++2Gd1et/uG9YllqV/wqKEE3oCMcj+fZwEf+/8S+KueHEj/80p4/92+v+Jgps07xRSs7SdDhc97+8X/cHXmzRfvvunVzTzlHxHk9YsuYs/vuP6HNe+ls8nrEprnn66Fju3o+0Fgf6qBmx8UhvGc0I0FnT83nEadPnz69Y8eOr9t2cA4+X9j58+Pk2S4JOntq7j337t/fP7Br185P2nVwDp/T/vUZdz9uN44EnU2/HztxtPaR+s/jJw/u3Llz/aHjJw7V+7gDh08c3Lt///fr1m1Yt379ht1uvyDBZ5IEnU3bt2/fetutC5a067Q5p3vvVh+3a9euzV9/vfW7b775ZvOePXt+qP37iUal/Y8lIh09fmsiVAAAAABJRU5ErkJggg==';

// Decode and save
const imgBuffer = Buffer.from(appleTouchIconBase64, 'base64');
const outputPath = path.join(__dirname, '../public/img/apple-icon.png');

fs.writeFileSync(outputPath, imgBuffer);

console.log('✅ Apple touch icon created: public/img/apple-icon.png');
console.log('   Size: 180x180 pixels');
console.log('');
console.log('Note: The SVG favicon (favicon.svg) is already working and will be used by modern browsers.');
console.log('The apple-icon.png is specifically for iOS home screen icons.');
