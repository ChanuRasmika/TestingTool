class User {
    constructor({
        id, 
        name, 
        email, 
        password_hash, 
        profile_url, 
        bank_balance,
        created_at, 
        updated_at
    }) {
        this.id = id
        this.name = name
        this.email = email
        this.password_hash = password_hash
        this.profile_url = profile_url
        this.bank_balance = bank_balance
        this.created_at = created_at
        this.updated_at = updated_at
    }
}

module.exports = User;