describe("Report arrival to TimeClock365", function() {
  it("signs in, punch in and start the task", function() {
    cy.visit("https://live.timeclock365.com/login");
    cy.get(":nth-child(3) > .login-page__input").type(Cypress.env("email"));
    cy.get(":nth-child(4) > .login-page__input").type(Cypress.env("pass"));
    cy.get(".login-page__submit").click();
    // click on punch in
    cy.get(".dashboard__punch-btn").click();
    // click on yes
    cy.get(".btn-primary").click();
    cy.get(':nth-child(1) > :nth-child(1) > .user-tasks > .user-tasks__btn').click();
  });
});
