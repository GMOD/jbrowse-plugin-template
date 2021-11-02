describe('My First Test', () => {
  it('visits JBrowse', () => {
    // You can put JBrowse 2 into any session you want this way at the beginning
    // of your test!
    cy.exec('shx cp cypress/fixtures/hello_view.json .jbrowse')
    cy.visit('/?config=hello_view.json')

    // The plugin successfully loads
    cy.contains('Hello plugin developers!')
  })
})
