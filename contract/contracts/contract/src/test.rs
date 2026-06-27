#![cfg(test)]
use super::*;
use soroban_sdk::{Env, String, Address};
use soroban_sdk::testutils::Address as _;

#[test]
fn test_full_supply_chain_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let manufacturer = Address::generate(&env);
    let distributor = Address::generate(&env);
    let retailer = Address::generate(&env);
    let inspector = Address::generate(&env);

    // Register a product
    let product_id = client.register_product(
        &manufacturer,
        &String::from_str(&env, "Organic Coffee Beans"),
        &String::from_str(&env, "Single-origin Arabica from Colombia"),
        &String::from_str(&env, "Bogota, Colombia"),
    );
    assert_eq!(product_id, 1);

    // Check product state
    let product = client.get_product(&product_id);
    assert_eq!(product.name, String::from_str(&env, "Organic Coffee Beans"));
    assert_eq!(product.origin, String::from_str(&env, "Bogota, Colombia"));
    assert_eq!(product.status, String::from_str(&env, "Created"));
    assert_eq!(product.checkpoint_count, 0);

    // Scan checkpoint at origin
    client.scan_checkpoint(
        &product_id,
        &manufacturer,
        &String::from_str(&env, "Bogota Warehouse"),
        &String::from_str(&env, "Harvested and packaged, quality check passed"),
    );
    assert_eq!(client.get_checkpoint_count(&product_id), 1);

    let cp = client.get_checkpoint(&product_id, &0);
    assert_eq!(cp.location, String::from_str(&env, "Bogota Warehouse"));

    // Transfer to distributor
    client.transfer_product(&product_id, &manufacturer, &distributor);
    let product = client.get_product(&product_id);
    assert_eq!(product.current_holder, distributor);
    assert_eq!(product.status, String::from_str(&env, "InTransit"));

    // Scan checkpoint by distributor
    client.scan_checkpoint(
        &product_id,
        &distributor,
        &String::from_str(&env, "Miami Port"),
        &String::from_str(&env, "Arrived at US port, customs cleared"),
    );
    assert_eq!(client.get_checkpoint_count(&product_id), 2);

    // Transfer to retailer
    client.transfer_product(&product_id, &distributor, &retailer);
    let product = client.get_product(&product_id);
    assert_eq!(product.current_holder, retailer);

    // Scan by retailer
    client.scan_checkpoint(
        &product_id,
        &retailer,
        &String::from_str(&env, "Brooklyn Store"),
        &String::from_str(&env, "Received on shelf, ready for sale"),
    );

    // Inspector verifies the product
    client.verify_product(
        &product_id,
        &inspector,
        &String::from_str(&env, "Verified"),
    );
    let product = client.get_product(&product_id);
    assert_eq!(product.status, String::from_str(&env, "Verified"));

    // Check final checkpoint count
    assert_eq!(client.get_checkpoint_count(&product_id), 3);
}

#[test]
fn test_multiple_products() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    let id1 = client.register_product(
        &alice,
        &String::from_str(&env, "Product A"),
        &String::from_str(&env, "First product"),
        &String::from_str(&env, "Factory 1"),
    );
    let id2 = client.register_product(
        &bob,
        &String::from_str(&env, "Product B"),
        &String::from_str(&env, "Second product"),
        &String::from_str(&env, "Factory 2"),
    );
    let id3 = client.register_product(
        &alice,
        &String::from_str(&env, "Product C"),
        &String::from_str(&env, "Third product"),
        &String::from_str(&env, "Factory 1"),
    );

    assert_eq!(id1, 1);
    assert_eq!(id2, 2);
    assert_eq!(id3, 3);
    assert_eq!(client.get_product_count(), 3);
}

#[test]
fn test_product_count() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);
    let user = Address::generate(&env);

    assert_eq!(client.get_product_count(), 0);

    client.register_product(
        &user,
        &String::from_str(&env, "Test"),
        &String::from_str(&env, "Test description"),
        &String::from_str(&env, "Origin"),
    );
    assert_eq!(client.get_product_count(), 1);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #1)")]
fn test_get_nonexistent_product() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    client.get_product(&999);
}

#[test]
fn test_checkpoint_returns_none_for_nonexistent() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);
    let user = Address::generate(&env);

    let pid = client.register_product(
        &user,
        &String::from_str(&env, "Test"),
        &String::from_str(&env, "Test"),
        &String::from_str(&env, "Origin"),
    );

    // Try a non-existent checkpoint on an existing product
    let result = client.try_get_checkpoint(&pid, &999);
    assert!(result.is_err());

    // Try a checkpoint on a non-existent product
    let result = client.try_get_checkpoint(&999, &0);
    assert!(result.is_err());
}
