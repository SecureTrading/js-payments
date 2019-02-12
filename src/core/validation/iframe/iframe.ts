export const getStylesFromUrl = (url: string) => {
  let urlAndParams = url.split('?');
  urlAndParams.shift();
  let params = urlAndParams[0].split('&');
  params = params.map(item => item.replace('style[', ''));
  params = params.map(item => item.replace(']=', ':'));
  return params;
};
