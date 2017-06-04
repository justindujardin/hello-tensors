import { HelloTensorsPage } from './app.po';

describe('hello-tensors App', () => {
  let page: HelloTensorsPage;

  beforeEach(() => {
    page = new HelloTensorsPage();
  });

  it('should display welcome message', done => {
    page.navigateTo();
    page.getParagraphText()
      .then(msg => expect(msg).toEqual('Welcome to app!!'))
      .then(done, done.fail);
  });
});
