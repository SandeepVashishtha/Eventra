# Secure Storage Cryptographic Lifecycle Management

This document describes the cryptographic lifecycle management system for `src/utils/secureStorage.js`, including key versioning, migration strategies, rotation workflows, and cryptographic configuration.

## Overview

The secure storage system provides AES-GCM encrypted localStorage wrapper built on the Web Crypto API. This document focuses on the cryptographic lifecycle management features that enable future-proofing, maintainability, and backward compatibility.

## Cryptographic Configuration

### Centralized Configuration

All cryptographic parameters are centralized in the `CRYPTO_CONFIG` object:

```javascript
const CRYPTO_CONFIG = {
  VERSION: 1,
  ALGORITHM: 'AES-GCM',
  KEY_LENGTH: 256,
  IV_LENGTH: 12,
  PBKDF2_ITERATIONS: 100_000,
  PBKDF2_HASH: 'SHA-256',
  SECRET_BYTE_LENGTH: 32, // 256-bit
};
```

### Configuration Parameters

- **VERSION**: Current payload format version (currently 1)
- **ALGORITHM**: Encryption algorithm (AES-GCM)
- **KEY_LENGTH**: AES key length in bits (256)
- **IV_LENGTH**: Initialization vector length in bytes (12)
- **PBKDF2_ITERATIONS**: PBKDF2 iteration count (100,000)
- **PBKDF2_HASH**: Hash algorithm for PBKDF2 (SHA-256)
- **SECRET_BYTE_LENGTH**: Length of random secrets in bytes (32 = 256-bit)

### Accessing Configuration

```javascript
import { getCryptoConfig } from './utils/secureStorage.js';

const config = getCryptoConfig();
console.log(config.VERSION); // 1
```

## Key Versioning

### Payload Structure

Encrypted payloads now include a version field to enable future cryptographic upgrades without breaking existing data.

#### Version 1 Payload Format

```json
{
  "version": 1,
  "iv": "base64-encoded-iv",
  "ciphertext": "base64-encoded-ciphertext"
}
```

#### Legacy Payload Format (Pre-Versioning)

Legacy payloads use the format: `ivBase64:ctBase64`

These are still supported for backward compatibility.

### Version Detection

The decryption logic automatically detects the payload format:

1. Attempts to parse as JSON (new versioned format)
2. If JSON parsing fails or lacks required fields, falls back to legacy format
3. Routes to appropriate version-specific decryption handler

### Version-Specific Decryption

Each version has its own decryption handler:

```javascript
const decryptVersionedPayload = async (storageKey, payload, key) => {
  const version = payload.version;
  
  switch (version) {
    case 1:
      return await decryptV1(storageKey, payload, key, encoder);
    default:
      throw new Error(`Unsupported payload version: ${version}`);
  }
};
```

## Key Metadata Storage

### Metadata Structure

Key metadata is stored separately from encrypted payloads in `eventra:key-metadata`:

```json
{
  "version": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "rotatedAt": "2024-06-01T00:00:00.000Z",
  "iterations": 100000,
  "algorithm": "AES-GCM",
  "keyLength": 256
}
```

### Metadata Fields

- **version**: Current cryptographic version
- **createdAt**: Timestamp when key material was first created
- **rotatedAt**: Timestamp when key was last rotated (optional)
- **iterations**: PBKDF2 iteration count used
- **algorithm**: Encryption algorithm used
- **keyLength**: Key length in bits

### Accessing Metadata

```javascript
import { getKeyMetadata } from './utils/secureStorage.js';

const metadata = getKeyMetadata();
console.log(metadata.version); // 1
console.log(metadata.createdAt); // "2024-01-01T00:00:00.000Z"
```

### Security Considerations

- Metadata does NOT contain sensitive secrets
- Metadata is stored in plain text in localStorage
- Metadata is used for debugging and future migration planning
- Key material itself remains encrypted and separate

## Migration Framework

### Purpose

The migration framework provides a structured way to upgrade cryptographic parameters and algorithms without data loss.

### Migration Architecture

```javascript
const migratePayload = async (fromVersion, toVersion, storageKey, plaintext) => {
  // Future migrations can be implemented here
  // For now, v1 is current, so no migration needed
  if (fromVersion === toVersion) {
    return await encryptValue(storageKey, plaintext);
  }
  
  // Example future migration:
  // if (fromVersion === 1 && toVersion === 2) {
  //   return await encryptV2(storageKey, plaintext);
  // }
  
  throw new Error(`Migration from v${fromVersion} to v${toVersion} not implemented`);
};
```

### Future Migration Example

When upgrading from version 1 to version 2:

1. Implement `encryptV2()` function with new cryptographic parameters
2. Implement `decryptV2()` function for version 2 payloads
3. Add migration case in `migratePayload()`
4. Update `CRYPTO_CONFIG.VERSION` to 2
5. Deploy and let existing data be migrated on access

### Migration Strategy Options

#### Option 1: Lazy Migration (Recommended)

- Migrate data on access (read/write)
- Gradual migration over time
- No bulk migration required
- Lower immediate performance impact

#### Option 2: Bulk Migration

- Migrate all data at once during deployment
- Faster complete migration
- Higher immediate performance impact
- Requires downtime or careful coordination

## Key Rotation

### Purpose

Key rotation generates new key material while preserving the ability to decrypt existing values during migration.

### Rotation Workflow

```javascript
import { rotateKey } from './utils/secureStorage.js';

// Rotate the key
const newMetadata = await rotateKey();

// Migrate existing data (optional but recommended)
const keys = ['key1', 'key2', 'key3'];
for (const key of keys) {
  const value = await syncSecureStorage.getItemAsync(key);
  if (value !== null) {
    await syncSecureStorage.setItem(key, value);
  }
}
```

### What Rotation Does

1. Generates new random key material (256-bit)
2. Generates new random salt (256-bit)
3. Stores new material in localStorage
4. Updates in-memory key material
5. Resets key derivation promise
6. Updates metadata with rotation timestamp

### What Rotation Does NOT Do

- Does NOT automatically migrate existing encrypted data
- Does NOT delete old encrypted data
- Does NOT clear localStorage
- Does NOT break existing data access

### Complete Migration After Rotation

To fully migrate existing data after rotation:

```javascript
import { syncSecureStorage, rotateKey } from './utils/secureStorage.js';

async function rotateAndMigrate() {
  // Step 1: Rotate the key
  await rotateKey();
  
  // Step 2: Get all tracked keys
  const keysMetadata = localStorage.getItem('eventra:keys');
  const keys = JSON.parse(keysMetadata || '[]');
  
  // Step 3: Re-encrypt each value with new key
  for (const key of keys) {
    const value = await syncSecureStorage.getItemAsync(key);
    if (value !== null) {
      await syncSecureStorage.setItem(key, value);
    }
  }
}
```

### When to Rotate Keys

Recommended rotation scenarios:

- After a security incident
- On a regular schedule (e.g., annually)
- When upgrading cryptographic parameters
- When changing PBKDF2 iteration count

## Backward Compatibility

### Guaranteed Compatibility

The implementation guarantees backward compatibility with:

1. **Legacy payload format**: `ivBase64:ctBase64`
2. **Existing encrypted data**: All data encrypted with previous versions
3. **Existing key material**: No forced key regeneration
4. **No breaking changes**: API remains stable

### Compatibility Strategy

1. **Dual format support**: Both legacy and versioned formats are supported
2. **Automatic detection**: Format is detected automatically during decryption
3. **Graceful fallback**: On decryption failure, raw value is returned
4. **No forced migration**: Existing data continues to work without migration

### Testing Backward Compatibility

To test backward compatibility:

```javascript
// Simulate legacy format
const legacyIv = btoa(String.fromCharCode(...new Uint8Array(12)));
const legacyCt = btoa(String.fromCharCode(...new Uint8Array(16)));
const legacyStored = `${legacyIv}:${legacyCt}`;

localStorage.setItem('legacy-key', legacyStored);

// Should decrypt successfully
const value = await syncSecureStorage.getItemAsync('legacy-key');
```

## Security Improvements

### What Changed

1. **Key Versioning**: Enables future cryptographic upgrades
2. **Centralized Configuration**: Easier maintenance and auditing
3. **Key Metadata**: Better tracking of cryptographic parameters
4. **Migration Framework**: Structured upgrade path
5. **Key Rotation**: Ability to rotate keys without data loss
6. **Configurable PBKDF2**: Iteration count can be adjusted

### What Stayed the Same

1. **Encryption Algorithm**: Still AES-GCM
2. **Key Derivation**: Still PBKDF2 with random material
3. **Security Model**: Same threat model and protections
4. **API Compatibility**: No breaking changes to public API

### Security Guarantees

- **No plaintext in localStorage**: Still enforced
- **Random IV per encryption**: Still enforced
- **Additional data binding**: Still uses storage key as AAD
- **PBKDF2 iterations**: Still 100,000 (configurable)
- **Key material**: Still random and per-browser

## API Reference

### New Functions

#### `getCryptoConfig()`

Returns the current cryptographic configuration.

```javascript
const config = getCryptoConfig();
// { VERSION: 1, ALGORITHM: 'AES-GCM', ... }
```

#### `getKeyMetadata()`

Returns the current key metadata.

```javascript
const metadata = getKeyMetadata();
// { version: 1, createdAt: '...', iterations: 100000, ... }
```

#### `rotateKey()`

Rotates the encryption key material.

```javascript
const newMetadata = await rotateKey();
// { version: 1, createdAt: '...', rotatedAt: '...', ... }
```

### Updated API

The `syncSecureStorage` object now includes:

```javascript
syncSecureStorage.getKeyMetadata()  // Returns key metadata
syncSecureStorage.getCryptoConfig() // Returns crypto config
syncSecureStorage.rotateKey()       // Rotates the key
```

## Testing

### Test Coverage

Comprehensive tests cover:

- Encryption/decryption of new values
- Decryption of legacy values
- Key metadata creation
- Version handling
- Migration framework behavior
- Key rotation workflow
- Backward compatibility scenarios
- Error handling
- Concurrent writes
- Integration scenarios

### Running Tests

```bash
npm test src/utils/secureStorage.test.js
```

## Best Practices

### For Developers

1. **Always use versioned format**: New writes automatically use versioned format
2. **Test backward compatibility**: Ensure legacy data still decrypts
3. **Plan migrations**: Use the migration framework for upgrades
4. **Document changes**: Update this document when changing crypto parameters
5. **Review iteration count**: Consider increasing PBKDF2 iterations over time

### For Operations

1. **Monitor key age**: Track key creation and rotation timestamps
2. **Plan rotations**: Schedule regular key rotations
3. **Test migrations**: Test migration in staging before production
4. **Backup data**: Ensure backups before bulk migrations
5. **Monitor errors**: Watch for decryption errors indicating compatibility issues

### For Security Audits

1. **Review CRYPTO_CONFIG**: Check for appropriate parameters
2. **Verify metadata**: Ensure metadata is accurate
3. **Check iteration count**: Verify PBKDF2 iterations are sufficient
4. **Audit rotations**: Review key rotation history
5. **Test compatibility**: Verify backward compatibility works

## Future Enhancements

### Potential Future Features

1. **Version 2**: Support for different algorithms (e.g., XChaCha20-Poly1305)
2. **Increased iterations**: Bump PBKDF2 iterations to 200,000 or higher
3. **Key wrapping**: Add support for key wrapping with master keys
4. **Multi-tenant support**: Separate keys per user/tenant
5. **Hardware-backed keys**: Support for WebAuthn or platform keys

### Migration Path

When implementing future enhancements:

1. Increment `CRYPTO_CONFIG.VERSION`
2. Implement new encryption/decryption functions
3. Add migration case in `migratePayload()`
4. Update documentation
5. Add tests for new version
6. Deploy with backward compatibility
7. Monitor migration progress

## Troubleshooting

### Common Issues

#### Decryption Fails for Legacy Data

**Problem**: Legacy data fails to decrypt

**Solution**: Ensure the key material hasn't changed. Check that the legacy format is `ivBase64:ctBase64`.

#### Version Not Supported

**Problem**: Error about unsupported payload version

**Solution**: Check that the version is implemented in `decryptVersionedPayload()`. May need to implement new version handler.

#### Key Rotation Breaks Data

**Problem**: After rotation, existing data can't be decrypted

**Solution**: Key rotation preserves old key material for decryption. Ensure you're not clearing localStorage. Migrate data after rotation.

#### Metadata Missing

**Problem**: `getKeyMetadata()` returns null or incomplete data

**Solution**: Metadata is auto-created on first load. Check localStorage for `eventra:key-metadata`. If corrupted, delete it and let it regenerate.

## References

- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [AES-GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode)
- [PBKDF2](https://en.wikipedia.org/wiki/PBKDF2)
- [NIST Cryptographic Standards](https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines)

## Changelog

### Version 1.0 (Current)

- Added centralized `CRYPTO_CONFIG`
- Implemented key versioning in payloads
- Added key metadata storage
- Implemented migration framework
- Added key rotation support
- Maintained backward compatibility with legacy format
- Added comprehensive test coverage
