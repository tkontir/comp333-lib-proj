// Use Mocha's describe() to group tests
describe('Utility Functions', function() {

    // Test the valid_email function
    it('Should identify valid and invalid emails.', function() {
        assert.equal(valid_email("hi@gmail.com"), true, 'hi@gmail.com should be valid');
        assert.equal(valid_email("hi@gmail"), false, 'hi@gmail should be invalid');
        // ADD MORE TESTS HERE
    });

    // Test the valid_pass function
    it('Should identify valid and invalid passwords.', function() {
        assert.equal(valid_pass("hello123"), true, 'hello123 should be valid');
        assert.equal(valid_pass("hi"), false, 'hi should be invalid');
        // ADD MORE TESTS HERE
    });

});