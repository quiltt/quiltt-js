import React from 'react'
import TestQuilttButton from './TestQuilttButton'

describe('<TestQuilttButton />', () => {
  it('renders', () => {
    // @ts-ignore
    cy.mount(<TestQuilttButton />)

    cy.get('button').should('have.text', 'Launch with Component')

    // Wait for script to become interactive. This is almost instananeous locally but takes time in CI.
    cy.wait(1250)

    // Launch the Connector
    cy.get('iframe#quiltt--frame').should('not.exist')
    cy.get('button').click()
    cy.get('iframe#quiltt--frame').should('be.visible')

    // @todo: Check that iframe is rendered. https://github.com/cypress-io/cypress/issues/136
    // cy.get('iframe#quiltt--frame').should('contains.text', 'Stitching finance together')
  })
})
