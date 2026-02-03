/** @type {import('@arpadroid/module').BuildConfigType} */
const config = {
    buildTypes: true,
    deps: ['messages', 'navigation', 'forms'],
    deferTypesBuild: ['navigation', 'messages', 'forms'],
    buildType: 'uiComponent',
    logo: `           ┓    • ┓  ┓•   
  ┏┓┏┓┏┓┏┓┏┫┏┓┏┓┓┏┫  ┃┓┏╋┏
  ┗┻┛ ┣┛┗┻┗┻┛ ┗┛┗┗┻  ┗┗┛┗┛
------┛---------------------`
};

export default config;
