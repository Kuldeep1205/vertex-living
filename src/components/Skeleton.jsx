import React from 'react';
import './Skeleton.css';

/* ── Primitive shimmer block ─────────────────── */
export function Bone({ width = '100%', height = '16px', radius = '6px', style = {} }) {
  return (
    <span
      className="sk-bone"
      style={{ width, height, borderRadius: radius, display: 'block', ...style }}
    />
  );
}

/* ── Property card skeleton ──────────────────── */
export function PropertyCardSkeleton() {
  return (
    <div className="sk-property-card">
      <div className="sk-img" />
      <div className="sk-body">
        <Bone height="13px" width="55%" radius="4px" />
        <Bone height="18px" width="85%" radius="4px" style={{ marginTop: 8 }} />
        <Bone height="13px" width="65%" radius="4px" style={{ marginTop: 6 }} />
        <Bone height="22px" width="45%" radius="4px" style={{ marginTop: 10 }} />
        <div className="sk-tags">
          <Bone height="24px" width="60px" radius="20px" />
          <Bone height="24px" width="50px" radius="20px" />
          <Bone height="24px" width="70px" radius="20px" />
        </div>
      </div>
    </div>
  );
}

/* ── Agent card skeleton ─────────────────────── */
export function AgentCardSkeleton() {
  return (
    <div className="sk-agent-card">
      <div className="sk-agent-photo" />
      <div className="sk-body">
        <Bone height="18px" width="70%" radius="4px" />
        <Bone height="13px" width="90%" radius="4px" style={{ marginTop: 8 }} />
        <div className="sk-agent-stats">
          <div className="sk-stat">
            <Bone height="22px" width="36px" radius="4px" />
            <Bone height="11px" width="40px" radius="4px" style={{ marginTop: 4 }} />
          </div>
          <div className="sk-stat">
            <Bone height="22px" width="36px" radius="4px" />
            <Bone height="11px" width="52px" radius="4px" style={{ marginTop: 4 }} />
          </div>
        </div>
        <Bone height="36px" width="100%" radius="10px" style={{ marginTop: 12 }} />
      </div>
    </div>
  );
}

/* ── Feature card skeleton ───────────────────── */
export function FeatureCardSkeleton() {
  return (
    <div className="sk-feature-card">
      <Bone width="48px" height="48px" radius="12px" />
      <Bone height="18px" width="60%" radius="4px" style={{ marginTop: 14 }} />
      <Bone height="12px" width="95%" radius="4px" style={{ marginTop: 10 }} />
      <Bone height="12px" width="80%" radius="4px" style={{ marginTop: 6 }} />
      <Bone height="12px" width="50%" radius="4px" style={{ marginTop: 6 }} />
    </div>
  );
}

/* ── Stat item skeleton ──────────────────────── */
export function StatSkeleton() {
  return (
    <div className="sk-stat-item">
      <Bone height="36px" width="80px" radius="6px" style={{ margin: '0 auto' }} />
      <Bone height="13px" width="60%" radius="4px" style={{ margin: '8px auto 0' }} />
    </div>
  );
}

/* ── Section header skeleton ─────────────────── */
export function SectionHeaderSkeleton() {
  return (
    <div className="sk-section-header">
      <Bone height="14px" width="80px" radius="20px" style={{ margin: '0 auto' }} />
      <Bone height="28px" width="260px" radius="6px" style={{ margin: '12px auto 0' }} />
      <Bone height="13px" width="340px" radius="4px" style={{ margin: '8px auto 0' }} />
    </div>
  );
}
