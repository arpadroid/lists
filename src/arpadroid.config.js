/** @type {import('@arpadroid/module').BuildConfigType} */
const config = {
    buildTypes: true,
    deps: ['messages', 'navigation', 'forms'],
    deferTypesBuild: ['navigation', 'messages', 'forms'],
    buildType: 'uiComponent',
    storybook_port: 6008,
    logo: `           ┓    • ┓  ┓•   
  ┏┓┏┓┏┓┏┓┏┫┏┓┏┓┓┏┫  ┃┓┏╋┏
  ┗┻┛ ┣┛┗┻┗┻┛ ┗┛┗┗┻  ┗┗┛┗┛
------┛---------------------`
};

export default config;
