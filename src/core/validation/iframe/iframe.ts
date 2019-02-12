export const getStylesFromUrl = (url: string) => {
  let urlAndParams = url.split('?');
  urlAndParams.shift();
  let params = urlAndParams[0].split('&');
  params.map(item => {
    return item.replace();
  });
  // let arry = [];
  // let arry1 = [];
  // @ts-ignore
  // for (var key of urlParams.keys()) {
  //   if (key.startsWith('style')) {
  //     arry.push(urlParams.get(key));
  //     let newKey = key.trim();
  //     newKey = key.replace('style[', '');
  //     newKey = newKey.replace(']', '');
  //     arry1.push(newKey);
  //   }
  // }
};
