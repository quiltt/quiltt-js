import React from 'react'
import TestHTMLLauncher from './TestHTMLLauncher'

describe('<TestHTMLLauncher />', () => {
  it('renders', () => {
    // @ts-ignore
    cy.mount(<TestHTMLLauncher />)

    cy.get('a').should('contains.text', 'Launch with HTML')

    // Wait for script to become interactive. This is almost instananeous locally but takes time in CI.
    cy.wait(1250)

    // Launch the Connector
    cy.get('iframe#quiltt--frame').should('not.exist')
    cy.get('a').click()
    cy.get('iframe#quiltt--frame').should('be.visible')

    // @todo: Check that iframe is rendered. https://github.com/cypress-io/cypress/issues/136
    // cy.get('iframe#quiltt--frame').should('contains.text', 'Stitching finance together')
  })
})
