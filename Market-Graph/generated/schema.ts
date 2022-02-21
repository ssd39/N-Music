// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class NFT extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("ownerid", Value.fromString(""));
    this.set("listed", Value.fromBoolean(false));
    this.set("contractid", Value.fromString(""));
    this.set("tokenid", Value.fromString(""));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save NFT entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save NFT entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("NFT", id.toString(), this);
    }
  }

  static load(id: string): NFT | null {
    return changetype<NFT | null>(store.get("NFT", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get ownerid(): string {
    let value = this.get("ownerid");
    return value!.toString();
  }

  set ownerid(value: string) {
    this.set("ownerid", Value.fromString(value));
  }

  get listed(): boolean {
    let value = this.get("listed");
    return value!.toBoolean();
  }

  set listed(value: boolean) {
    this.set("listed", Value.fromBoolean(value));
  }

  get price(): i32 {
    let value = this.get("price");
    return value!.toI32();
  }

  set price(value: i32) {
    this.set("price", Value.fromI32(value));
  }

  get contractid(): string {
    let value = this.get("contractid");
    return value!.toString();
  }

  set contractid(value: string) {
    this.set("contractid", Value.fromString(value));
  }

  get tokenid(): string {
    let value = this.get("tokenid");
    return value!.toString();
  }

  set tokenid(value: string) {
    this.set("tokenid", Value.fromString(value));
  }
}
