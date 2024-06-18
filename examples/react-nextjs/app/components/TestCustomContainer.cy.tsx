import { TestCustomContainer } from './TestCustomContainer'

describe('<TestCustomContainer />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<TestCustomContainer />)

    // Find the iframe in the container
    cy.get('div[quiltt-container="connector"]').within(() => {
      cy.get('iframe#quiltt--frame').should('be.visible')
    })
  })
})
