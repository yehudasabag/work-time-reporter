describe("Report departure to TimeClock365", function() {
  it("signs in, punch in and start the task", function() {
    cy.visit("https://live.timeclock365.com/login");
    cy.get(":nth-child(3) > .login-page__input").type(Cypress.env("email"));
    cy.get(":nth-child(4) > .login-page__input").type(Cypress.env("pass"));
    cy.get(".login-page__submit").click();
    // click on punch out
    cy.get(".dashboard__punch-btn").click();
    // click on yes, pause the task and punch out
    cy.get(".dashboard-modal__button_blue").click();
  });
});
