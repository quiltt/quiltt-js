import { TestQuilttContainer } from './TestQuilttContainer'

describe('<TestQuilttContainer />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<TestQuilttContainer />)

    // Find the iframe in the container
    cy.get('div[quiltt-container="connector"]').within(() => {
      cy.get('iframe#quiltt--frame').should('be.visible')
    })
  })
})
