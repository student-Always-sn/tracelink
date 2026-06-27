#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, panic_with_error, Address, Env, String, Symbol};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotFound = 1,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Product {
    pub id: u64,
    pub name: String,
    pub description: String,
    pub origin: String,
    pub current_holder: Address,
    pub status: String,
    pub checkpoint_count: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Checkpoint {
    pub product_id: u64,
    pub checkpoint_id: u32,
    pub handler: Address,
    pub location: String,
    pub notes: String,
    pub timestamp: u64,
}

#[contracttype]
pub enum DataKey {
    Product(u64),
    Checkpoint(u64, u32),
    ProductCount,
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn __constructor(_env: Env) {}

    /// Register a new product. Returns the auto-incremented product ID.
    #[allow(deprecated)]
    pub fn register_product(
        env: Env,
        manufacturer: Address,
        name: String,
        description: String,
        origin: String,
    ) -> u64 {
        manufacturer.require_auth();

        let mut count: u64 = env.storage().instance().get(&DataKey::ProductCount).unwrap_or(0);
        count += 1;

        let product = Product {
            id: count,
            name: name.clone(),
            description,
            origin: origin.clone(),
            current_holder: manufacturer.clone(),
            status: String::from_str(&env, "Created"),
            checkpoint_count: 0,
        };

        env.storage().persistent().set(&DataKey::Product(count), &product);
        env.storage().instance().set(&DataKey::ProductCount, &count);

        env.events().publish(
            (Symbol::new(&env, "product_registered"),),
            (count, manufacturer, name),
        );

        count
    }

    /// Record a checkpoint scan at a location. Requires handler auth.
    #[allow(deprecated)]
    pub fn scan_checkpoint(
        env: Env,
        product_id: u64,
        handler: Address,
        location: String,
        notes: String,
    ) {
        handler.require_auth();

        let mut product: Product = env.storage().persistent()
            .get(&DataKey::Product(product_id))
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotFound));

        let checkpoint_id = product.checkpoint_count;
        let checkpoint = Checkpoint {
            product_id,
            checkpoint_id,
            handler: handler.clone(),
            location: location.clone(),
            notes,
            timestamp: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&DataKey::Checkpoint(product_id, checkpoint_id), &checkpoint);

        product.checkpoint_count += 1;
        if product.status == String::from_str(&env, "Created") {
            product.status = String::from_str(&env, "InTransit");
        }
        env.storage().persistent().set(&DataKey::Product(product_id), &product);

        env.events().publish(
            (Symbol::new(&env, "checkpoint_scanned"),),
            (product_id, handler, location, checkpoint_id),
        );
    }

    /// Transfer product custody. Requires current holder auth.
    #[allow(deprecated)]
    pub fn transfer_product(
        env: Env,
        product_id: u64,
        from: Address,
        to: Address,
    ) {
        from.require_auth();

        let mut product: Product = env.storage().persistent()
            .get(&DataKey::Product(product_id))
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotFound));

        product.current_holder = to.clone();
        product.status = String::from_str(&env, "InTransit");
        env.storage().persistent().set(&DataKey::Product(product_id), &product);

        env.events().publish(
            (Symbol::new(&env, "product_transferred"),),
            (product_id, from, to),
        );
    }

    /// Verify or reject a product. Requires inspector auth.
    #[allow(deprecated)]
    pub fn verify_product(
        env: Env,
        product_id: u64,
        inspector: Address,
        status: String,
    ) {
        inspector.require_auth();

        let mut product: Product = env.storage().persistent()
            .get(&DataKey::Product(product_id))
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotFound));

        product.status = status.clone();
        env.storage().persistent().set(&DataKey::Product(product_id), &product);

        env.events().publish(
            (Symbol::new(&env, "product_verified"),),
            (product_id, inspector, status),
        );
    }

    /// Get product details by ID. Panics if not found.
    pub fn get_product(env: Env, product_id: u64) -> Product {
        env.storage().persistent()
            .get(&DataKey::Product(product_id))
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotFound))
    }

    /// Get a specific checkpoint. Panics if not found.
    pub fn get_checkpoint(env: Env, product_id: u64, checkpoint_id: u32) -> Checkpoint {
        env.storage().persistent()
            .get(&DataKey::Checkpoint(product_id, checkpoint_id))
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotFound))
    }

    /// Get number of checkpoints for a product.
    pub fn get_checkpoint_count(env: Env, product_id: u64) -> u32 {
        let product: Product = env.storage().persistent()
            .get(&DataKey::Product(product_id))
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotFound));
        product.checkpoint_count
    }

    /// Get total number of registered products.
    pub fn get_product_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::ProductCount).unwrap_or(0)
    }
}

mod test;
