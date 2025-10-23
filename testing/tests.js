/* Unit tests for utility functions using Mocha and Chai
    Unit tests for the valid_email and valid_pass functions.
*/

describe('Utility Functions', function() {

    // Test the valid_email function
    it('Should identify valid and invalid emails.', function() {
        assert.equal(valid_email("hi@gmail.com"), true, 'hi@gmail.com should be valid');
        assert.equal(valid_email("hi@gmail"), false, 'hi@gmail should be invalid');
        assert.equal(valid_email("user.name+tag@sub.example.co.uk"), true, 'user.name+tag@sub.example.co.uk should be valid');
        assert.equal(valid_email(" user@domain.com "), false, 'emails with surrounding spaces should be invalid');
        assert.equal(valid_email(""), false, 'empty string should be invalid');
    });

    // Test the valid_pass function
    it('Should identify valid and invalid passwords.', function() {
        assert.equal(valid_pass("hello123@"), true, 'hello123@ should be valid');
        assert.equal(valid_pass("hi"), false, 'hi should be invalid');
        assert.equal(valid_pass("password"), false, 'password (no number, no special) should be invalid');
        assert.equal(valid_pass("password1"), false, 'password1 (no special) should be invalid');
        assert.equal(valid_pass("P@ssw0rd123!"), true, 'P@ssw0rd123! should be valid');
    });

});