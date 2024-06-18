import TestJSLauncher from './TestJSLauncher'

describe('<TestJSLauncher />', () => {
  it('renders', () => {
    cy.mount(<TestJSLauncher />)

    cy.get('button').should('contains.text', 'Launch with Javascript')

    // Wait for script to become interactive. This is almost instananeous locally but takes time in CI.
    cy.wait(1250)

    // Launch the Connector
    cy.get('iframe#quiltt--frame').should('not.exist')
    cy.get('button').click()
    cy.get('iframe#quiltt--frame').should('be.visible')

    // TODO: Check that iframe is rendered. https://github.com/cypress-io/cypress/issues/136
    // cy.get('iframe#quiltt--frame').should('contains.text', 'Stitching finance together')
  })
})
